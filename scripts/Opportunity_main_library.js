/// <reference path="../typescript/XrmServiceToolkit.d.ts" />
/// <reference path="../typescript/Xrm2011.1_0.d.ts" />
// Update the required / disabled state of the ac_materialnumberid field when the user changes the value of the ac_existingmaterial field
function updateExistingMaterial() {
    // Required Levels
    var NOT_REQUIRED = 0;
    var REQUIRED = 1;

    var oExistingMaterial = Xrm.Page.getAttribute("ac_existingmaterial");
    var oMaterialNumber = Xrm.Page.getAttribute("ac_materialnumberid");

    if (oExistingMaterial.getValue() == true) {
        Xrm.Page.ui.controls.get("ac_materialnumberid").setDisabled(false);
        Xrm.Page.getAttribute("ac_materialnumberid").setRequiredLevel("required");
    } else {
        Xrm.Page.ui.controls.get("ac_materialnumberid").setDisabled(true);
        oMaterialNumber.setValue(null);
        Xrm.Page.getAttribute("ac_materialnumberid").setRequiredLevel("none");
    }
}

// Update the value in the ac_riskadjustedestrevenue field.
function recalculateRiskAdjustedEstRevenue() {
    var oRiskAdjusted = Xrm.Page.getAttribute("ac_riskadjustedestrevenue");
    var oEstValue = Number(Xrm.Page.getAttribute("estimatedvalue").getValue());
    var oProbability = Number(Xrm.Page.getAttribute("closeprobability").getValue());
    var num = 100;
    var oProbPercent = oProbability / num;
    var riskAdjusted = oEstValue * oProbPercent;

    if (oEstValue != null && oProbability != null) {
        oRiskAdjusted.setValue(riskAdjusted);
        oRiskAdjusted.setSubmitMode("always");
    }
}

// Update the value of the estimatedvalue field.
function recalculateEstimatedRevenue() {
    var oEstValue = Xrm.Page.getAttribute("estimatedvalue");
    var oCustomerDemandAnnualVolume = Number(Xrm.Page.getAttribute("ac_annualvolume").getValue());
    var oEstPrice = Number(Xrm.Page.getAttribute("ac_estprice").getValue());
    var oFMCShare = Number(Xrm.Page.getAttribute("ac_fmcshare").getValue());

    if (oCustomerDemandAnnualVolume != null && oEstPrice != null && oFMCShare != null && oEstValue != null) {
        oEstValue.setValue(oCustomerDemandAnnualVolume * oEstPrice * (oFMCShare / 100));
        oEstValue.setSubmitMode("always");

        recalculateRiskAdjustedEstRevenue();
    }
}

function ac_producthierarchyid_onchange() {
}
function ac_existingmaterial_onchange() {
    updateExistingMaterial();
}
function ac_estprice_onchange() {
    recalculateEstimatedRevenue();
}
function ac_annualvolume_onchange() {
    recalculateEstimatedRevenue();
}
function ac_fmcshare_onchange() {
    recalculateEstimatedRevenue();
}
function closeprobability_onchange() {
    recalculateRiskAdjustedEstRevenue();
}
function estimatedvalue_onchange() {
    recalculateRiskAdjustedEstRevenue();
}
