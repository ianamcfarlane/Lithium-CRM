/// <reference path="../typescript/Xrm.d.ts" />
/// <reference path="../typescript/XrmServiceToolkit.d.ts" />
function Form_onload() {
    filterMaterialNumberByCustomer(false);
}

// Filter Material Number lookup by Customer lookup if Customer type is account
function filterMaterialNumberByCustomer(bCalledByOnChange) {
    if (Xrm.Page.getAttribute("ac_materialnumberid").getValue() != null && Xrm.Page.getAttribute("customerid").getValue() != null) {
        if (Xrm.Page.getAttribute("customerid").getValue()[0].type == 1) {
            var oTarget = Xrm.Page.getAttribute("ac_materialnumberid");
            var oFilteredOn = Xrm.Page.getAttribute("customerid");
            var entityName = "ac_materialnumber";
            var viewDisplayName = "Material Number";
            var viewId = "{a76b3c46-c28e-4e5e-9ddf-951b71202c9d}";
            var fetchXml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='true'><entity name='ac_materialnumber'><attribute name='ac_materialnumberid'/><attribute name='ac_name'/><attribute name='createdon'/><order attribute='ac_name' descending='false'/><link-entity name='ac_accountproduct' from='ac_materialnumberid' to='ac_materialnumberid' alias='aa'><filter type='and'><condition attribute='ac_accountid' operator='eq' uitype='account' value='" + Xrm.Page.getAttribute("customerid").getValue()[0].id + "'/></filter></link-entity></entity></fetch>";

            var layoutXml = "<grid name='resultset' " + "object='1' " + "jump='name' " + "select='1' " + "icon='1' " + "preview='1'>" + "<row name='result' " + "id='ac_materialnumberid'>" + "<cell name='ac_name' " + "width='200' />" + "<cell name='ac_materialdescription' " + "width='200' />" + "</row>" + "</grid>";

            Xrm.Page.getControl("ac_materialnumberid").addCustomView(viewId, entityName, viewDisplayName, fetchXml, layoutXml, true);

            if (bCalledByOnChange == true) {
                oTarget.setValue(null);
            }
        } else {
            //oTarget.setDisabled(true);
            oTarget.setValue(null);
        }
    }
}

function submitComplaint() {
    var yes = confirm("Submit this Complaint?");
    if (yes == true) {
        Xrm.Page.getAttribute("statuscode").setValue('2');
        Xrm.Page.getAttribute("statuscode").setSubmitMode("always");
        var currentdate = new Date();
        var totaltime = Math.round((Xrm.Page.getAttribute("createdon").getValue() - currentdate) / (86400000)).toString();
        Xrm.Page.getAttribute("ac_daysinvestigated").setValue(Math.abs(totaltime).toString());
        Xrm.Page.getAttribute("ac_daysinvestigated").setSubmitMode("always");

        Xrm.Page.data.save();
    }
}

function Form_onsave(prmContext) {
    // Lith run on onsave
    var DEACTIVATE = 5;
    var mode = prmContext.getEventArgs().getSaveMode();
    if (mode == DEACTIVATE) {
        var currentdate = new Date();
        var totaltime = Math.round((Xrm.Page.getAttribute("createdon").getValue() - currentdate) / (86400000)).toString();
        Xrm.Page.getAttribute("ac_daysoutstanding").setValue(Math.abs(totaltime).toString());
        Xrm.Page.getAttribute("ac_daysoutstanding").setSubmitMode("always");
    }
}

function customerid_onchange() {
    filterMaterialNumberByCustomer(true);
}
