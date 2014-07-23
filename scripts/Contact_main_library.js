/// <reference path="../typescript/XrmServiceToolkit.d.ts" />
/// <reference path="../typescript/Xrm2011.1_0.d.ts" />
// Copy business address to mailing address
function copyBusinessAddressToMailingAddress() {
    var lookupData;
    var lookupItem;

    // Text data
    Xrm.Page.getAttribute("address2_line1").setValue(Xrm.Page.getAttribute("address1_line1").getValue());
    Xrm.Page.getAttribute("address2_line2").setValue(Xrm.Page.getAttribute("address1_line2").getValue());
    Xrm.Page.getAttribute("address2_line3").setValue(Xrm.Page.getAttribute("address1_line3").getValue());
    Xrm.Page.getAttribute("address2_city").setValue(Xrm.Page.getAttribute("address1_city").getValue());
    Xrm.Page.getAttribute("address2_postalcode").setValue(Xrm.Page.getAttribute("address1_postalcode").getValue());

    if (Xrm.Page.getAttribute("ac_stateprovinceid").getValue() != null) {
        lookupData = new Array();
        lookupItem = new Object();

        lookupItem.id = Xrm.Page.getAttribute("ac_stateprovinceid").getValue()[0].id;
        lookupItem.entityType = 'ac_state';
        lookupItem.name = Xrm.Page.getAttribute("ac_stateprovinceid").getValue()[0].name;
        lookupData[0] = lookupItem;
        Xrm.Page.getAttribute("ac_mailingstateid").setValue(lookupData);
    } else {
        Xrm.Page.getAttribute("ac_mailingstateid").setValue(null);
    }

    if (Xrm.Page.getAttribute("ac_countryid").getValue() != null) {
        lookupData = new Array();
        lookupItem = new Object();

        lookupItem.id = Xrm.Page.getAttribute("ac_countryid").getValue()[0].id;
        lookupItem.entityType = 'ac_country';
        lookupItem.name = Xrm.Page.getAttribute("ac_countryid").getValue()[0].name;
        lookupData[0] = lookupItem;
        Xrm.Page.getAttribute("ac_mailingcountryid").setValue(lookupData);
    } else {
        Xrm.Page.getAttribute("ac_mailingcountryid").setValue(null);
    }
}
