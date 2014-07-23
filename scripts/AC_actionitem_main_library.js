/// <reference path="../typescript/Xrm.d.ts" />
/// <reference path="../typescript/XrmServiceToolkit.d.ts" />
function Form_onload() {
    if (Xrm.Page.getAttribute("statuscode").getValue() == '4') {
        disableFormFields(true);
    }
}

function disableFormFields(onOff) {
    Xrm.Page.ui.controls.forEach(function (control, index) {
        if (doesControlHaveAttribute(control)) {
            control.setDisabled(onOff);
        }
    });
}
function doesControlHaveAttribute(control) {
    var controlType = control.getControlType();
    return controlType != "iframe" && controlType != "webresource" && controlType != "subgrid";
}
