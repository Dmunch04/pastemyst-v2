import Dropdown from "../components/dropdown.js";
import { PastyEditor } from "../data/editor.js";

export let editors = [];

export function initEditors()
{
    let editorElements = document.getElementsByClassName("pasty-editor");

    for (let i = 0; i < editorElements.length; i++)
    {
        let editor = new PastyEditor;

        editor.index = i;

        editor.rootElement = editorElements[i];
        editor.titleInput = editor.rootElement.getElementsByClassName("pasty-editor-title")[0];

        let textarea = editor.rootElement.getElementsByClassName("editor")[0];

        editor.editor = CodeMirror.fromTextArea(textarea,
        {
            indentUnit: 4,
            lineNumbers: true,
            mode: "text/plain",
            tabSize: 4,
            theme: "darcula",
            lineWrapping: true
        });

        editor.languageDropdown = setupLanguageDropdown(editor, false);

        editor.rootElement.getElementsByClassName("pasty-editor-delete")[0].addEventListener("click", () =>
        {
            removeEditor(editor);
        });

        editors.push(editor);
    }
}

export function addEditor()
{
    let editor = new PastyEditor();

    editor.index = editors.length;

    let clone = editors[editors.length - 1].rootElement.cloneNode(true);

    editor.rootElement = clone;

    clone.getElementsByClassName("CodeMirror")[0].remove();

    let titleInput = clone.getElementsByClassName("pasty-editor-title")[0];

    editor.titleInput = titleInput;
    editor.titleInput.value = "";

    let textArea = clone.getElementsByClassName("editor")[0];
    textArea.innerText = "";

    // TODO: set initial mode
    editor.editor = CodeMirror.fromTextArea(textArea, // jshint ignore:line
    {
        indentUnit: 4,
        lineNumbers: true,
        mode: "text/plain",
        tabSize: 4,
        theme: "darcula",
        lineWrapping: true
    });

    document.getElementById("pasty-editors").appendChild(clone);

    editors.push(editor);

    setupDeleteButton(editor);

    if (editors.length === 2)
    {
        setupDeleteButton(editors[0]);
    }

    editor.languageDropdown = setupLanguageDropdown(editor, true);

    editor.rootElement.getElementsByClassName("pasty-editor-delete")[0].addEventListener("click", () =>
    {
        removeEditor(editor);
    });

    editor.editor.refresh();
    editor.editor.focus();

    setMode(editor.editor, "null", "null");
}

function removeEditor(editor)
{
    if (editors.length === 1)
    {
        return;
    }

    editor.rootElement.remove();

    editors.splice(editor.index, 1);

    if (editors.length === 1)
    {
        removeDeleteButton(editors[0]);
    }

    for (let i = 0; i < editors.length; i++)
    {
        editors[i].index = i;
    }
}

function setupDeleteButton(editor)
{
    editor.rootElement.getElementsByClassName("pasty-editor-delete")[0].style.display = "initial";
    let titleInput = editor.rootElement.getElementsByClassName("pasty-editor-title")[0];
    titleInput.style.borderTopLeftRadius = "0";
}

function removeDeleteButton(editor)
{
    editor.rootElement.getElementsByClassName("pasty-editor-delete")[0].style.display = "none";
    let titleInput = editor.rootElement.getElementsByClassName("pasty-editor-title")[0];
    titleInput.style.borderTopLeftRadius = "0.3rem";
}

function setupLanguageDropdown(editor, reset)
{
    let languageDropdown = new Dropdown(editor.rootElement.querySelector(".language-dropdown .dropdown"));

    if (reset)
    {
        languageDropdown.resetValue();
    }

    languageDropdown.onValueChange = (v) =>
    {
        // using 1 and 2 because the first index is the name
        let s = v.split(",");
        setMode(editor.editor, s[1], s[2]);
    };

    let l = languageDropdown.value.split(",");
    setMode(editor.editor, l[1], l[2]);

    return languageDropdown;
}

function setMode(editor, mode, mime)
{
    if (mode === "null")
    {
        editor.setOption("mode", "text/plain");
        return;
    }

    import(`../libs/codemirror/${mode}/${mode}.js`).then(() => // jshint ignore:line
    {
        editor.setOption("mode", mime);
    });
}