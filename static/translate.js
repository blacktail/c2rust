'use strict';

var samples =
  { insertion: "void insertion_sort(int const n, int * const p) {\n\
\n\
    for (int i = 1; i < n; i++) {\n\
        int const tmp = p[i];\n\
        int j = i;\n\
        while (j > 0 && p[j-1] > tmp) {\n\
                p[j] = p[j-1];\n\
                j--;\n\
        }\n\
        p[j] = tmp;\n\
    }\n\
}\n",

    gotos: "int sum(int count) {\n\
    goto a;\n\
\n\
    b:\n\
    --count;\n\
    goto d;\n\
\n\
    a:;\n\
    int x = 0;\n\
    goto d;\n\
\n\
    c:\n\
    return x;\n\
\n\
    d:\n\
    if(count <= 0)\n\
    goto c;\n\
    goto e;\n\
\n\
    e:\n\
    x += count;\n\
    goto b;\n\
}\n",

  vla: "int vla_index(int a, int xs[][a], int i) {\n\
    return xs[i];\n\
}\n\
\n\
void vla_alloc(int a, int b) {\n\
    int xs[a][b];\n\
    \n\
    for (int i = 0; i < a; i++) {\n\
        for (int j = 0; j < b; j++) {\n\
            xs[i][j] = 1;\n\
        }\n\
    }\n\
}\n",

  variadic: "int printf(const char *, ...);\n\
\n\
int main(const int argc, char *argv[const]) {\n\
    for (int i = 0; i < argc; i++) {\n\
	const char *format = \"arg[%d] = %s\\n\";\n\
        printf(format, i, argv[i]);\n\
    }\n\
}\n",


  };

var sample_selector = document.getElementById('sample_list');

for (var x in samples) {
    var option = document.createElement('option');
    option.value = x;
    option.text = x;
    sample_selector.add(option);
}

function downloadData(type, filename, data) {
    var blob = new Blob([data], {type: type});
    if(window.navigator.msSaveOrOpenBlob) {
        window.navigator.msSaveBlob(blob, filename);
    }
    else{
        var elem = window.document.createElement('a');
        elem.href = window.URL.createObjectURL(blob);
        elem.download = filename;
        document.body.appendChild(elem);
        elem.click();
        document.body.removeChild(elem);
    }
}

var c_editor = ace.edit("c_src");
c_editor.session.setMode("ace/mode/c_cpp");

var rust_editor = ace.edit("rust_src");
rust_editor.session.setMode("ace/mode/rust");

var uploadFile = document.getElementById('uploadFile')
var upload     = document.getElementById('upload')
var download   = document.getElementById('download')
var translate  = document.getElementById('translate')
var sample_button = document.getElementById('load_sample');

sample_button.addEventListener("click", function(event) {
    c_editor.setValue(samples[sample_selector.value]);
    c_editor.clearSelection();
});

translate.addEventListener("click", function(event) {
    var data = { src: c_editor.getValue(), };

    $.post({
        url: '/translate',
        data: data,
        dataType: 'text',
        success: function(resp, status, jqXHR) {
            rust_editor.session.setMode("ace/mode/rust");
            rust_editor.setValue(resp);
            rust_editor.clearSelection();
            $("#rust_editor .editor_title").text("Generated Rust source code")
        },
    }).fail(function(e) {
        var errorObj = $.parseJSON(e.responseText);
        rust_editor.session.setMode("ace/mode/text");
        rust_editor.setValue(errorObj.description);
        rust_editor.clearSelection();

        $("#rust_editor .editor_title").text("Error message")
    });
});

download.addEventListener("click", function(event) {
        downloadData('text/rust', 'output.rs', rust_editor.getValue());
});

// Event handler for reading an "uploaded" file into the textarea
uploadFile.addEventListener("change", function(event){
    var reader = new FileReader();
    reader.onload = function(event) {
        var contents = event.target.result;
        c_editor.setValue(contents);
        uploadFile.value = null;
    };
    reader.readAsText(uploadFile.files[0]);
});

upload.addEventListener("click", function(event) {
        uploadFile.click();
});
