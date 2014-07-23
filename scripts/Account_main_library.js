/// <reference path="../typescript/XrmServiceToolkit.d.ts" />
/// <reference path="../typescript/Xrm2011.1_0.d.ts" />
function Form_onload() {
    var NOTIFICATIONS_DISPLAY_ID = "Notifications";
    var TIER_A_PICKLIST_VALUE = "1";
    energySection();
    checkForSap();
}

function checkForSap() {
    if (Xrm.Page.getAttribute("accountnumber").getValue() != null) {
        Xrm.Page.getControl("accountnumber").setDisabled(true);
        Xrm.Page.getControl("ac_name1").setDisabled(true);
        Xrm.Page.getControl("ac_accountname2").setDisabled(true);
        Xrm.Page.getControl("ac_name3").setDisabled(true);
        Xrm.Page.getControl("ac_name4").setDisabled(true);
        Xrm.Page.getControl("address1_line1").setDisabled(true);
        Xrm.Page.getControl("address1_city").setDisabled(true);
        Xrm.Page.getControl("ac_stateprovinceid").setDisabled(true);
        Xrm.Page.getControl("ac_countryid").setDisabled(true);
        Xrm.Page.getControl("address1_postalcode").setDisabled(true);
        Xrm.Page.getControl("ac_termsofpaymentid").setDisabled(true);
        Xrm.Page.getControl("transactioncurrencyid").setDisabled(true);
        Xrm.Page.getControl("accountclassificationcode").setDisabled(true);
        Xrm.Page.getControl("ac_soldto").setDisabled(true);
        Xrm.Page.getControl("ac_accounttype").setDisabled(true);
        Xrm.Page.getControl("ac_salesregionid").setDisabled(true);
        Xrm.Page.getControl("ac_synthesis").setDisabled(true);
        Xrm.Page.getControl("ac_primaries").setDisabled(true);
        Xrm.Page.getControl("ac_polymers").setDisabled(true);
        Xrm.Page.getControl("ac_energy").setDisabled(true);
    }
}

// Displays the Energy Section if the Energy radio button (ac_energy) is set
function energySection() {
    if (Xrm.Page.getAttribute("ac_energy").getValue() == true) {
        Xrm.Page.ui.tabs.sections.get("Energy").setVisible(true);
        Xrm.Page.ui.tabs.sections.get("EnergyDetails").setVisible(true);
        primaryDetailsSection();
        secondaryDetailsSection();
        anodeDetailsSection();
        cathodeDetailsSection();
        electrolyteDetailsSection();
        separatorDetailsSection();
    } else {
        Xrm.Page.ui.tabs.get("Energy").setVisible(false);
        Xrm.Page.ui.tabs.get("PrimaryDetails").setVisible(false);
        Xrm.Page.ui.tabs.get("EnergyDetails").setVisible(false);
        Xrm.Page.ui.tabs.get("AnodeDetails").setVisible(false);
        Xrm.Page.ui.tabs.get("SecondaryDetails").setVisible(false);
        Xrm.Page.ui.tabs.get("CathodeDetails").setVisible(false);
        Xrm.Page.ui.tabs.get("Electrolyte").setVisible(false);
        Xrm.Page.ui.tabs.get("Separator").setVisible(false);
    }
    // Update the sub sections this section effects...
}

// If the Primary Energy End Use field is set (ac_primaryenergyenduse)
// and the Energy section is visible then display the Primary Details Section
function primaryDetailsSection() {
    if (Xrm.Page.getAttribute("ac_primaryenergyenduse").getValue() == true) {
        Xrm.Page.ui.tabs.get("PrimaryDetails").setVisible(true);
    } else {
        Xrm.Page.ui.tabs.get("PrimaryDetails").setVisible(false);
    }
}

// If the Secondary Energy End Use field is set (ac_primaryenergyenduse)
// and the Energy section is visible then display the Secondary Details Section
function secondaryDetailsSection() {
    if (Xrm.Page.getAttribute("ac_secondaryenergyenduse").getValue() == true) {
        Xrm.Page.ui.tabs.get("SecondaryDetails").setVisible(true);
    } else {
        Xrm.Page.ui.tabs.get("SecondaryDetails").setVisible(false);
    }
}

// If the Anode field on the Energy Details section is set (ac_anode) then display the Anode Details Section
function anodeDetailsSection() {
    if (Xrm.Page.getAttribute("ac_anode").getValue() == true) {
        Xrm.Page.ui.tabs.get("AnodeDetails").setVisible(true);
    } else {
        Xrm.Page.ui.tabs.get("AnodeDetails").setVisible(false);
    }
}

// If the Cathode field on the Energy Details section is set (ac_cathode) then display the Cathode Details Section
function cathodeDetailsSection() {
    if (Xrm.Page.getAttribute("ac_cathode").getValue() == true) {
        Xrm.Page.ui.tabs.get("CathodeDetails").setVisible(true);
    } else {
        Xrm.Page.ui.tabs.get("CathodeDetails").setVisible(false);
    }
}

// If the Electrolyte field on the Energy Details section is set (ac_electrolyte) then display the Electrolyte Details Section
function electrolyteDetailsSection() {
    if (Xrm.Page.getAttribute("ac_electrolyte").getValue() == true) {
        Xrm.Page.ui.tabs.get("Electrolyte").setVisible(true);
    } else {
        Xrm.Page.ui.tabs.get("Electrolyte").setVisible(false);
    }
}

// If the Separator field on the Energy Details section is set (ac_separator) then display the Separator Details Section
function separatorDetailsSection() {
    if (Xrm.Page.getAttribute("ac_separator").getValue() == true) {
        Xrm.Page.ui.tabs.get("Separator").setVisible(true);
    } else {
        Xrm.Page.ui.tabs.get("Separator").setVisible(false);
    }
}

// Get and then assign the path of the BI report
function setBIDashboard() {
    var accountNumber = Xrm.Page.getAttribute("accountnumber").getValue();
    var reportUrl = 'http://sappdbp1.fmc.fmcworld.com:51100/irj/servlet/prt/portal/prtroot/pcd!3aportal_content!2fcom.sap.pct!2fplatform_add_ons!2fcom.sap.ip.bi!2fiViews!2fcom.sap.ip.bi.bex?QUERY=z5_copa_crm_dashboard2&BI_COMMAND_1-BI_COMMAND_TYPE=SET_VARIABLES_STATE&BI_COMMAND_1-VARIABLE_VALUES-VARIABLE_VALUE_1-VARIABLE=ZCUSTOMER&BI_COMMAND_1-VARIABLE_VALUES-VARIABLE_VALUE_1-VARIABLE_TYPE=VARIABLE_INPUT_STRING&BI_COMMAND_1-VARIABLE_VALUES-VARIABLE_VALUE_1-VARIABLE_TYPE-VARIABLE_INPUT_STRING=' + accountNumber + '&oId={948414E5-16BE-DB11-8764-005056995278}&oType=1&oTypeName=account&security=852407&tabSet=InvokeNavItem_Report1Area& login_submit=on&login_do_redirect=1&no_cert_storing=on&j_user=crmtobil&j_password=1muihtil&j_authscheme=default&uiPasswordLogon=Logon';
    window.open(reportUrl, 'viewSapReportWindow', 'resizable=1,status=1,menubar=1,scrollbars=1,width=550,height=350');
}

function ac_energy_onchange() {
    energySection();
}
function ac_primaryenergyenduse_onchange() {
    energySection();
}
function ac_secondaryenergyenduse_onchange() {
    energySection();
}
function ac_anode_onchange() {
    energySection();
}
function ac_cathode_onchange() {
    energySection();
}
function ac_electrolyte_onchange() {
    energySection();
}
function ac_separator_onchange() {
    energySection();
}
