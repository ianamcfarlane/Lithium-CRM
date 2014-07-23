/// <reference path="../typescript/XrmServiceToolkit.d.ts" />
/// <reference path="../typescript/Xrm2011.1_0.d.ts" />
// fields we cannot copy due to CRM restrictions
var attribName = "ac_podid";
var ob = "owningbusinessunit";
var tz = "timezoneruleversionnumber";
var mb = "modifiedby";
var pq = "ac_pricequoteid";
var mo = "modifiedon";
var oid = "ownerid";
var sc = "statecode";
var ou = "owninguser";
var cb = "createdby";
var status = "statuscode";
var co = "createdon";
var ac_name = "ac_name";
var so = 'ac_submittedon';

function onCloneRecordClick() {
    try  {
        if (confirm('Do you want to create a duplicate record?')) {
            // Create Clone Record and Retrieve Primary Key
            var _id = makeClone(Xrm.Page.data.entity.getEntityName(), Xrm.Page.data.entity.getId());

            if (confirm('Duplicate record created successfully.\nDo you want to open it?')) {
                var attribName = Xrm.Page.data.entity.getEntityName();
                var clientUrl = Xrm.Page.context.getClientUrl();
                var etc = Xrm.Page.context.getQueryStringParameters().etc;
                var _url = clientUrl + "/main.aspx?etc=" + etc + "&extraqs=&histKey=116827158&id=%7b" + _id + "%7d&newWindow=true&pagetype=entityrecord";
                window.open(_url, "_window");
            }
        }
    } catch (ex) {
        showError(ex.description);
    }
}

// Create Clone Record
function makeClone(entityName, objId) {
    var attribName = Xrm.Page.data.entity.getEntityName() + "id";
    var fetchXML = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false'>" + "<entity name='" + entityName + "'>" + "<all-attributes />" + "<filter type='and'>" + "<condition attribute='" + attribName + "' operator='eq' value='" + objId + "' />" + "</filter>" + "</entity>" + "</fetch>";

    var oSource = XrmServiceToolkit.Soap.Fetch(fetchXML);

    // Create Clone Record
    var oClone = new XrmServiceToolkit.Soap.BusinessEntity(entityName);

    for (var p in oSource[0].attributes) {
        if (p != ac_name && p != attribName && p != ob && p != tz && p != mb && p != pq && p != mo && p != oid && p != sc && p != ou && p != cb && p != status && p != co && p != so && p != null) {
            oClone.attributes[p] = oSource[0].attributes[p];
        }
    }
    var id = XrmServiceToolkit.Soap.Create(oClone);
    return id;
}

// Retrieve URL to Open CRM Form
function getFormURL(entityName, objId) {
    var path = "../../../userdefined/edit.aspx?id=" + objId + "&etn=" + entityName;
    return path;
}

// Show Error Message
function showError(message) {
    var notificationsArea = document.getElementById('Notifications');

    if (notificationsArea == null) {
        alert(message);
        return;
    }
    notificationsArea.title = '0';
    var notificationHTML = "<div class='Notification'><table cellpadding='0' cellspacing='0'><tbody><tr><td valign='top'><img alt='' class='ms-crm-Lookup-Item' src='/_imgs/error/notif_icn_crit16.png'></td><td" + message + "</td></tr></tbody></table></div>";

    notificationsArea.innerHTML += notificationHTML;
    notificationsArea.style.display = 'block';
}
