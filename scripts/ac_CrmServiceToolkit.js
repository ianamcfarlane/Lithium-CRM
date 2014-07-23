CrmServiceToolkit = (function () {
    /**
    * Crm Web Service Toolkit 1.0
    *
    * @author Daniel Cai
    * @website http://danielcai.blogspot.com/
    * @copyright Daniel Cai
    * @license Microsoft Public License (Ms-PL), http://www.opensource.org/licenses/ms-pl.html
    *
    * This release is provided "AS IS" and contains no warranty or whatsoever.
    *
    * The following CRM JavaScript functions have been used in order to keep the file size minimal.
    *    GenerateAuthenticationHeader() function
    *    _HtmlEncode() function
    *    CrmEncodeDecode.CrmXmlDecode() function
    *    CrmEncodeDecode.CrmXmlEecode() function
    *
    * Date: Jan 21 2010
    */
    var _dateTimeExpr = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})[\.\d{3}]?([-+]\d{2}):(\d{2})$/, _numberExpr = /^[-+]?\d*\.?\d*$/, _positiveIntegerExpr = /^(0|[1-9]\d*)$/;

    //  Prototype of native JS Number object to support the type conversion for Bit type.
    Number.prototype.toBoolean = function () {
        return (this === null) ? null : (this == 1);
    };

    // Private members
    /**
    * Make a CRM Web Service call.
    * @param {String} soapBody The CRM Web Service request's SOAP message body
    * @param {String} requestType The CRM Web Service request's type, e.g., Execute, Retrieve, Fetch, Create, Update, etc.
    * @return {object} The result XML document of the CRM Web Service Request.
    */
    var _doRequest = function (soapBody, requestType) {
        //Wrap the Soap Body in a soap:Envelope.
        var soapXml = "<soap:Envelope xmlns:soap='http://schemas.xmlsoap.org/soap/envelope/' xmlns:xsi='http://www.w3.org/2001/XMLSchema-instance' xmlns:xsd='http://www.w3.org/2001/XMLSchema'>" + GenerateAuthenticationHeader() + "<soap:Body>" + "<" + requestType + " xmlns='http://schemas.microsoft.com/crm/2007/WebServices'>" + soapBody + "</" + requestType + ">" + "</soap:Body>" + "</soap:Envelope>";
        alert("hi = " + soapXml);

        // var attribName = Xrm.Page.data.entity.getEntityName();
        // var serverUrl = Xrm.Page.context.getServerUrl();
        // var context, crmServerUrl;
        // if (typeof GetGlobalContext != "undefined") {
        // context = GetGlobalContext();
        // }
        // else if (typeof Xrm != "undefined") {
        // context = Xrm.Page.context;
        // }
        // else {
        // throw new Error("CRM context is not available.");
        // }
        // if (context.isOutlookClient() && !context.isOutlookOnline()) {
        // var _url = "/MSCRMServices/2007/crmservice.asmx";
        // }
        // else if (serverUrl.indexOf('lithium.') >= 0){
        // var _url = "/MSCRMServices/2007/crmservice.asmx";
        // }
        // else if (serverUrl.indexOf('/lithium/') >= 0){
        // var _url = "/lithium/MSCRMServices/2007/crmservice.asmx";
        // }
        var xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
        xmlhttp.open("POST", "/MSCRMServices/2007/crmservice.asmx", false);
        xmlhttp.setRequestHeader("Content-Type", "text/xml; charset=utf-8");
        xmlhttp.setRequestHeader("SOAPAction", "http://schemas.microsoft.com/crm/2007/WebServices/" + requestType);

        //Send the XMLHTTP object.
        xmlhttp.send(soapXml);

        var responseXml = xmlhttp.responseXML;
        if (responseXml === null || responseXml.xml === null || responseXml.xml === "") {
            if (xmlhttp.responseText !== null && xmlhttp.responseText !== "") {
                throw new Error(xmlhttp.responseText);
            } else {
                throw new Error("No response received from the server. ");
            }
        }

        // Report the error if occurred
        var error = responseXml.selectSingleNode("//error");
        var faultString = responseXml.selectSingleNode("//faultstring");

        if (error !== null || faultString !== null) {
            throw new Error(error !== null ? responseXml.selectSingleNode('//description').nodeTypedValue : faultString.text);
        }

        // Load responseXML and return as an XML object
        var xmlDoc = new ActiveXObject("Microsoft.XMLDOM");
        xmlDoc.async = false;
        xmlDoc.loadXML(responseXml.xml);
        return xmlDoc;
    };

    var _padNumber = function (s, len) {
        len = len || 2;

        s = '' + s;
        while (s.length < len) {
            s = "0" + s;
        }
        return s;
    };

    var _getDatePart = function (s) {
        s = s.replace(/^0+(.)$/, "$1");
        return parseInt(s);
    };

    var _parseDate = function (s) {
        if (s == null || !s.match(_dateTimeExpr)) {
            return null;
        }

        var dateParts = _dateTimeExpr.exec(s);
        return new Date(_getDatePart(dateParts[1]), _getDatePart(dateParts[2]) - 1, _getDatePart(dateParts[3]), _getDatePart(dateParts[4]), _getDatePart(dateParts[5]), _getDatePart(dateParts[6]));
    };

    var _encodeDate = function (dateTime) {
        return dateTime.getFullYear() + "-" + _padNumber(dateTime.getMonth() + 1) + "-" + _padNumber(dateTime.getDate()) + "T" + _padNumber(dateTime.getHours()) + ":" + _padNumber(dateTime.getMinutes()) + ":" + _padNumber(dateTime.getSeconds());
    };

    var _parseResultXmlNode = function (fieldNode) {
        var field = {};

        for (var k = 0; k < fieldNode.attributes.length; k++) {
            field[fieldNode.attributes[k].nodeName] = CrmEncodeDecode.CrmXmlDecode(fieldNode.attributes[k].nodeValue);
        }

        var nodeText = CrmEncodeDecode.CrmXmlDecode(fieldNode.text);

        if (fieldNode.attributes.length === 1 && fieldNode.getAttribute("formattedvalue") !== null && nodeText.match(_numberExpr)) {
            if (!nodeText.indexOf('.')) {
                field["value"] = parseInt(nodeText);
            } else {
                field["value"] = parseFloat(nodeText);
            }
        } else if (fieldNode.attributes.length === 2 && fieldNode.getAttribute("formattedvalue") !== null && fieldNode.getAttribute("name") !== null && nodeText.match(_positiveIntegerExpr)) {
            // Picklist from Fetch query
            field["value"] = parseInt(nodeText);
        } else if (fieldNode.attributes.length === 1 && fieldNode.getAttribute("name") !== null && nodeText.match(_positiveIntegerExpr)) {
            // Picklist field from Retrieve/RetrieveMultiple request,
            // or bit field from Fetch/Retrieve request,
            // or statecode/statuscode field
            field["value"] = parseInt(nodeText);
        } else if (fieldNode.attributes.length === 2 && fieldNode.getAttribute("date") !== null && fieldNode.getAttribute("time") !== null && nodeText.match(_dateTimeExpr)) {
            // Datetime
            field["value"] = _parseDate(nodeText);
        } else {
            // Other than above types, it's pretty safe to say the value is string type.
            field["value"] = nodeText;
        }

        return field;
    };

    /**
    * Business Entity object.
    */
    var _businessEntity = function (entityName) {
        this.name = entityName;
        this.attributes = new Object();
    };

    /**
    * Business Entity's instance function to retrieve the value of a particular CRM attribute.
    * @param {String} field The CRM field's name, it's called attribute in CRM terminology.
    * @param {String} attribute (optional) The attribute of the CRM field. If provided, a representation value of the CRM field is returned, otherwise, the field's actual database value is returned.
    * @return {Number/Date/String/null} The CRM entity's field value.
    */
    _businessEntity.prototype.getValue = function (field, attribute) {
        if (this.attributes.hasOwnProperty(field)) {
            return (attribute === undefined) ? this.attributes[field].value : this.attributes[field][attribute];
        }
        return null;
    };

    /**
    * Serialize a CRM Business Entity object to XML string in order to be passed to CRM Web Services.
    * @return {String} The serialized XML string of CRM entity.
    */
    _businessEntity.prototype.serialize = function () {
        var xml = '<entity xsi:type="' + this.name + '">';

        for (var attributeName in this.attributes) {
            var attribute = this.attributes[attributeName];
            var value = attribute.value || attribute;

            xml += '<' + attributeName + (!attribute.type ? '' : ' type="' + CrmEncodeDecode.CrmXmlEncode(attribute.type) + '"') + '>' + ((typeof value === "object" && value.getTime) ? _encodeDate(value) : CrmEncodeDecode.CrmXmlEncode(value)) + '</' + attributeName + '>';
        }

        xml += '</entity>';
        return xml;
    };

    /**
    * Deserialize an XML node into a CRM Business Entity object. The XML node comes from CRM Web Service's response.
    * @param {object} resultNode The XML node returned from CRM Web Service's Fetch, Retrieve, RetrieveMultiple messages.
    */
    _businessEntity.prototype.deserialize = function (resultNode) {
        var resultNodes = resultNode.childNodes;
        for (var i = 0; i < resultNodes.length; i++) {
            var fieldNode = resultNodes[i];
            this.attributes[fieldNode.baseName] = _parseResultXmlNode(fieldNode);
        }
    };

    // Public static members
    return {
        /**
        * Business Entity object, which is the container object passed to or returned by CRM Web Service Helper methods as parameter or result.
        * @param {String} entityName The entity's name
        */
        BusinessEntity: _businessEntity,
        /**
        * Retrieve a CRM business entity object.
        * @param {String} entityName The CRM entity name, e.g., account, contact, lead, etc.
        * @param {String} id The GUID of CRM record to be retrieved.
        * @param {Array} columnSet (optional) The array of columns to be retrieved.
        * @return {BusinessEntity} A BusinessEntity object.
        */
        Retrieve: function (entityName, id, columnSet) {
            var attributes = "";
            if (columnSet !== undefined) {
                for (var i = 0; i < columnSet.length; i++) {
                    attributes += "<q1:Attribute>" + columnSet[i] + "</q1:Attribute>";
                }
            }
            var msgBody = "<entityName>" + entityName + "</entityName>" + "<id>" + id + "</id>" + "<columnSet xmlns:q1='http://schemas.microsoft.com/crm/2006/Query' xsi:type='q1:ColumnSet'>" + "<q1:Attributes>" + attributes + "</q1:Attributes>" + "</columnSet>";

            var resultXml = _doRequest(msgBody, "Retrieve");

            var retrieveResult = resultXml.selectSingleNode("//RetrieveResult");

            var entity = new _businessEntity();
            entity.deserialize(retrieveResult);
            return entity;
        },
        /**
        * Retrieve a collection of business entity instances of a specified type based on query criteria.
        * @param {String} query The CRM query in XML format, which contains EntityName, ColumnSet, Criteria, and etc.
        * @return {Array} A collection of business entity (BusinessEntity) instances.
        */
        RetrieveMultiple: function (query) {
            var msgBody = "<Request xsi:type='RetrieveMultipleRequest' ReturnDynamicEntities='false'>" + "<Query xmlns:q1='http://schemas.microsoft.com/crm/2006/Query' xsi:type='q1:QueryExpression'>" + query + "</Query>" + "</Request>";

            var resultXml = _doRequest(msgBody, "Execute");

            var resultNodes = resultXml.selectNodes("//BusinessEntityCollection/BusinessEntities/BusinessEntity");
            var results = [];

            for (var i = 0; i < resultNodes.length; i++) {
                var entity = new _businessEntity();
                entity.deserialize(resultNodes[i]);
                results[i] = entity;
            }

            return results;
        },
        /**
        * Retrieve entity instances in XML format based on the specified query expressed in the FetchXML query language.
        * @param {String} fetchXml The fetch query string to be executed.
        * @return {Array} A collection of business entity (BusinessEntity) instances.
        */
        Fetch: function (fetchXml) {
            var msgBody = "<fetchXml>" + _HtmlEncode(fetchXml) + "</fetchXml>";
            var resultXml = _doRequest(msgBody, "Fetch");

            var fetchResult = resultXml.selectSingleNode("//FetchResult");
            resultXml.loadXML(fetchResult.childNodes[0].nodeValue);
            var resultNodes = resultXml.selectNodes("/resultset/result");

            var results = [];

            for (var i = 0; i < resultNodes.length; i++) {
                var entity = new _businessEntity();
                entity.deserialize(resultNodes[i]);
                results[i] = entity;
            }

            return results;
        },
        /**
        * Execute a message that represents either a specialized method or specific business logic.
        * @param {String} request The request to be executed in XML format.
        * @return {object} The XML representation of the result.
        */
        Execute: function (request) {
            return _doRequest(request, "Execute");
        },
        /**
        * Create a CRM business entity instance.
        * @param {BusinessEntity} businessEntity The CRM business object to be created.
        * @return {string} The record ID (GUID) that has been created in CRM system.
        */
        Create: function (businessEntity) {
            var request = businessEntity.serialize();

            var resultXml = _doRequest(request, "Create");
            var response = resultXml.selectSingleNode("//CreateResponse/CreateResult");
            return CrmEncodeDecode.CrmXmlDecode(response.text);
        },
        /**
        * Update a CRM business entity instance.
        * @param {BusinessEntity} businessEntity The CRM business object to be created.
        * @return {string} The update response
        */
        Update: function (businessEntity) {
            var request = businessEntity.serialize();

            var resultXml = _doRequest(request, "Update");
            var response = resultXml.selectSingleNode("//UpdateResponse");
            return CrmEncodeDecode.CrmXmlDecode(response.text);
        },
        /**
        * Delete a CRM business entity instance.
        * @param {string} entityName The CRM entity name.
        * @param {string} id The CRM record's ID to be deleted (GUID).
        * @return {string} The delete response
        */
        Delete: function (entityName, id) {
            var request = "<entityName>" + entityName + "</entityName>" + "<id>" + id + "</id>";

            var resultXml = _doRequest(request, "Delete");
            var response = resultXml.selectSingleNode("//DeleteResponse");
            return CrmEncodeDecode.CrmXmlDecode(response.text);
        },
        /**
        * Parse a UTC date format string to a JavaScript Date object.
        * @param {String} s The date string in UTC format, such as 2000-03-20T00:00:00-08:00.
        * @return {Date} JavaScript Date object.
        */
        ParseDate: _parseDate,
        /**
        * Convert a JavaScript object to a UTC date format string.
        * @param {Date} dateTime The JavaScript Date to be converted to UTC format string.
        * @return {String} Converted UTC format string, such as 2000-03-20T00:00:00-08:00.
        */
        EncodeDate: _encodeDate
    };
})();
