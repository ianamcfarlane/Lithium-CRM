/// <reference path="../typescript/XrmServiceToolkit.d.ts" />
/// <reference path="../typescript/Xrm2011.1_0.d.ts" />
function Form_onload() {
    // ac_approvedecline picklist values
    var APPROVE_APPROVEDECLINE_VALUE = "1";
    var DECLINE_APPROVEDECLINE_VALUE = "2";

    // ac_stage picklist values
    var APPROVED_STAGE_VALUE = "2";
    var DECLINED_STAGE_VALUE = "6";
    var AWAITING_APPROVAL_STAGE_VALUE = "8";

    // Required Levels
    var NOT_REQUIRED = 0;
    var REQUIRED = 1;

    securityMeasuresOnApproval();
    setDefaultDueDate();
    stageBasedEnableControl();
    updateSampleRequestUsability();
    lockDownNatureOfRequest();

    if (Xrm.Page.getAttribute("ac_accountid").getValue() != null) {
        setFieldReqLevel("", REQUIRED);
        Xrm.Page.getAttribute("ac_requestorid").setRequiredLevel("required");
    }
}
function Form_onsave() {
    // Validates the Tracking and SAP number fields' contents
    function Ascentium_FormValidation() {
        var NEW_REQUEST = "1";
        var APPROVED_REQUEST = "2";
        var ENTERED_IN_SAP = "3";
        var REQUEST_SHIPPED = "4";
        var AWAITING_APPROVAL = "8";

        if (Xrm.Page.ui.getFormType() == 1) {
            if (Xrm.Page.getAttribute("ac_accountid").getValue() != null && Xrm.Page.getAttribute("ac_leadid").getValue() == null) {
                // Set the Stage to Approved
                Xrm.Page.getAttribute("ac_stage").setValue(AWAITING_APPROVAL);
                Xrm.Page.getAttribute("ac_stage").setSubmitMode("always");
            } else if (Xrm.Page.getAttribute("ac_accountid").getValue() == null && Xrm.Page.getAttribute("ac_leadid").getValue() != null) {
                // Set the Stage to New
                Xrm.Page.getAttribute("ac_stage").setValue(NEW_REQUEST);
                Xrm.Page.getAttribute("ac_stage").setSubmitMode("always");
            } else if (Xrm.Page.getAttribute("ac_accountid").getValue() == null && Xrm.Page.getAttribute("ac_leadid").getValue() == null) {
                // Display an appropriate error message
                alert("Please select an Account or Lead to parent the Request.");

                // Cancel the save operation.
                event.returnValue = false;
                return false;
            } else if (Xrm.Page.getAttribute("ac_accountid").getValue() != null && Xrm.Page.getAttribute("ac_leadid").getValue() != null) {
                // Display an appropriate error message
                alert("Please select either an Account or a Lead to parent the Request.");

                // Cancel the save operation.
                event.returnValue = false;
                return false;
            }
        } else if (Xrm.Page.ui.getFormType() == 2) {
            if (crmForm.all.ac_sap.IsDirty == true && Xrm.Page.getAttribute("ac_sap").getValue() != null) {
                // Set the Stage to Entered In SAP
                Xrm.Page.getAttribute("ac_stage").setValue(ENTERED_IN_SAP);
                Xrm.Page.getAttribute("ac_stage").setSubmitMode("always");
            } else if (crmForm.all.ac_sap.IsDirty == true && Xrm.Page.getAttribute("ac_sap").getValue() == null) {
                // Set the Stage to Approved
                Xrm.Page.getAttribute("ac_stage").setValue(APPROVED_REQUEST);
                Xrm.Page.getAttribute("ac_stage").setSubmitMode("always");
            }

            if (crmForm.all.ac_tracking.IsDirty == true && Xrm.Page.getAttribute("ac_tracking").getValue() != null) {
                // Set the Stage to Shipped
                Xrm.Page.getAttribute("ac_stage").setValue(REQUEST_SHIPPED);
                Xrm.Page.getAttribute("ac_stage").setSubmitMode("always");
            } else if (crmForm.all.ac_tracking.IsDirty == true && Xrm.Page.getAttribute("ac_tracking").getValue() == null) {
                // Set the Stage to Entered In SAP
                Xrm.Page.getAttribute("ac_stage").setValue(ENTERED_IN_SAP);
                Xrm.Page.getAttribute("ac_stage").setSubmitMode("always");
            }
        }
    }

    function Ascentium_OnSave() {
        Ascentium_FormValidation();
    }

    Ascentium_OnSave();
}

// Occurs when the user clicks the Approve ISV button
function approveButton() {
    // Change the stage and approved/declined setting
    Xrm.Page.getAttribute("ac_stage").setValue(APPROVED_STAGE_VALUE);
    Xrm.Page.getAttribute("ac_approvedecline").setValue(APPROVE_APPROVEDECLINE_VALUE);

    // Issue a save
    Xrm.Page.data.entity.save();
}

// Occurs when the user clicks the Decline ISV button
function onChangeOfAc_PlantId() {
    var plantRep = Xrm.Page.getAttribute("ac_plantrepresentativeid");
    var plant = Xrm.Page.getAttribute("ac_plantid");

    if (plant.getValue() != null) {
        if (typeof (Ascentium_CrmService) !== 'undefined') {
            var plantId = plant.getValue()[0].id;

            //create the Ascentium_CrmService object
            var oService = new Ascentium_CrmService(Xrm.Page.context.getOrgUniqueName());
            var sFetchXml = "<fetch mapping='logical' count='50' version='1.0'><entity name='systemuser'><attribute name='fullname' /><attribute name='systemuserid' /><link-entity name='ac_plant' from='ac_plantreprensentativeid' to='systemuserid'><filter><condition attribute='ac_plantid' operator='eq' value='" + plantId + "' /></filter></link-entity></entity></fetch>";

            // We should have one systemuser
            var aoFetchResult = oService.Fetch(sFetchXml);

            if (aoFetchResult.length > 0) {
                var beResult = aoFetchResult[0];

                // Get the information...
                var lookupData = new Array();
                var lookupItem = new Object();

                //Set the id, typename, and name properties to the object.
                lookupItem.id = beResult.attributes["systemuserid"].value;
                lookupItem.entityType = 'systemuser';
                lookupItem.name = beResult.attributes["fullname"].value;

                lookupData[0] = lookupItem;
                plantRep.setValue(lookupData);
                plantRep.ForceSubmit = true;
            } else {
                plantRep.setValue(null);
                plantRep.ForceSubmit = true;
            }
        }
    } else {
        // No value...
        plantRep.setValue(null);
        plantRep.ForceSubmit = true;
    }
}

// Get the date and add 10 days to it. That is the Due Date
function setDefaultDueDate() {
    if (Xrm.Page.ui.getFormType() == 1) {
        var now = new Date();
        var nowDay = now.getDate();

        // Add the new value...
        nowDay += 10;

        // Make the new date...
        now.setDate(nowDay);

        // Update the control...
        Xrm.Page.getAttribute("ac_duedate").setValue(now);
    }
}

// Controls the user's ability to use certain fields based on the current stage
function stageBasedEnableControl() {
    var NEW_REQUEST = "1";
    var APPROVED_REQUEST = "2";
    var ENTERED_IN_SAP = "3";
    var REQUEST_SHIPPED = "4";

    if (Xrm.Page.getAttribute("ac_stage").getValue() == NEW_REQUEST) {
        Xrm.Page.getControl("ac_sap").setDisabled(true);
        Xrm.Page.getControl("ac_tracking").setDisabled(true);
    } else if (Xrm.Page.getAttribute("ac_stage").getValue() == APPROVED_REQUEST) {
        Xrm.Page.getControl("ac_tracking").setDisabled(true);
    } else if (Xrm.Page.getAttribute("ac_stage").getValue() == ENTERED_IN_SAP) {
        Xrm.Page.getControl("ac_sap").setDisabled(true);
    } else {
        Xrm.Page.getControl("ac_sap").setDisabled(true);
        Xrm.Page.getControl("ac_tracking").setDisabled(true);
    }
}

// Update the Disabled state of the Sample Request field on the form
function updateSampleRequestUsability() {
    // these values range from organization to organization.
    // For code clarity they have been placed into holder variables.
    var REQUEST_TYPE_SAMPLE_REQUEST = "1";
    var oTypePicklist = Xrm.Page.getAttribute("ac_natureofrequest");

    crmForm.all.ac_samplesize.Disabled = !(oTypePicklist.getValue() == REQUEST_TYPE_SAMPLE_REQUEST);
    if (crmForm.all.ac_samplesize.Disabled) {
        Xrm.Page.getAttribute("ac_samplesize").setValue(null);
        Xrm.Page.getAttribute("ac_samplesize").setSubmitMode("always");
        Xrm.Page.getAttribute("ac_samplesize").setRequiredLevel("none");
        Xrm.Page.getAttribute("ac_unitofmeasureid").setRequiredLevel("none");
        Xrm.Page.getAttribute("ac_producthierarchyid").setRequiredLevel("none");
    } else {
        Xrm.Page.getAttribute("ac_samplesize").setRequiredLevel("required");
        Xrm.Page.getAttribute("ac_unitofmeasureid").setRequiredLevel("required");
        Xrm.Page.getAttribute("ac_producthierarchyid").setRequiredLevel("required");
    }
}

// After a value is initially set this will make subsequent visits to the form make the Nature of Request field disabled.
function lockDownNatureOfRequest() {
    if (Xrm.Page.ui.getFormType() == 2 && Xrm.Page.getAttribute("ac_natureofrequest").getValue() != null) {
        Xrm.Page.getControl("ac_natureofrequest").setDisabled(true);
    }
}

// Setup the Filtering on the Account Manager lookup and hide the ISV buttons if they are visible.
function securityMeasuresOnApproval() {
    // Filter the Account Manager lookup on the Request form
    var RoleName = "Account Manager";
    var oTarget = Xrm.Page.getAttribute("ac_accountmanagerid");

    var entityName = "systemuser";
    var viewDisplayName = "Account Manager";
    var viewId = "{a76b2c46-c28e-4e5e-9ddf-951b71202c9e}";
    var fetchXml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='true'><entity name='systemuser'><attribute name='fullname' /><attribute name='businessunitid' /><attribute name='title' /><attribute name='address1_telephone1' /><attribute name='systemuserid' /><order attribute='fullname' descending='false' /><link-entity name='systemuserroles' from='systemuserid' to='systemuserid' visible='false' intersect='true'><link-entity name='role' from='roleid' to='roleid' alias='aa'><filter type='and'><condition attribute='name' operator='eq' value='Account Manager' /></filter></link-entity></link-entity></entity></fetch>";
    var layoutXml = "<grid name='resultset' " + "object='1' " + "jump='name' " + "select='1' " + "icon='1' " + "preview='1'>" + "<row name='result' " + "id='ac_accountmanagerid'>" + "<cell name='fullname' " + "width='300' />" + "<cell name='title' " + "width='100' />" + "</row>" + "</grid>";

    Xrm.Page.getControl("ac_accountmanagerid").addCustomView(viewId, entityName, viewDisplayName, fetchXml, layoutXml, true);

    // Perform a WhoAmI request with the JavaScript service to retrieve the current user's Id.
    var gCurrentUserId = WhoAmI();
}

// Perform a WhoAmI request and return the Id returned
function WhoAmI() {
    var UserGUID = Xrm.Page.context.getUserId();
    if (UserGUID != null) {
        return UserGUID;
    }
}

function ac_natureofrequest_onchange() {
    updateSampleRequestUsability();
}
function ac_sap_onchange() {
    performPlantRequiredLevelUpdate();
}
function ac_plantid_onchange() {
    onChangeOfAc_PlantId();
}
