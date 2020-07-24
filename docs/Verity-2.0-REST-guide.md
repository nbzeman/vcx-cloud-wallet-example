


# REST API guide for Verity Server

General data[a]
Data is sent as JSON on: 


https://vas-team1.pdev.evernym.com/api/XNRkA8tboikwHD3x1Yh7Uz[b][c]/<protocol-family>/<protocol-version>[/<threadId>] with auth header:


"X-API-key: HZ3Ak6pj9ryFASKbA9fpwqjVh42F35UDiCLQ13J58Xoh:4Wf6JtGy9enwwXVKcUgADPq7Pnf9T2YZ8LupMEVxcQQf98uuRYxWGHLAwXWp8DtaEYHo4cUeExDjApMfvLJQ48Kp"

## Endpoint 

Responses are received at this page:
https://requestbin.com/r/enazy4stgnrep
Specific protocols examples
Write schema protocol
Write
Method: POST


URL: https://vas-team1.pdev.evernym.com/api/XNRkA8tboikwHD3x1Yh7Uz/write-schema/0.6


## Auth Header:

"X-API-key: HZ3Ak6pj9ryFASKbA9fpwqjVh42F35UDiCLQ13J58Xoh:4Wf6JtGy9enwwXVKcUgADPq7Pnf9T2YZ8LupMEVxcQQf98uuRYxWGHLAwXWp8DtaEYHo4cUeExDjApMfvLJQ48Kp"


Data: 
{
  "@id": String, optional, random id,[d][e]
  "@type": "did:sov:123456789abcdefghi1234;spec/write-schema/0.6/write[f][g]",
  "name": String, name of schema,
  "version": String, version of schema,
  "attrNames": List of strings, attributes of schema,[h][i]
}


Example:
curl -XPOST -v -H "X-API-key: HZ3Ak6pj9ryFASKbA9fpwqjVh42F35UDiCLQ13J58Xoh:4Wf6JtGy9enwwXVKcUgADPq7Pnf9T2YZ8LupMEVxcQQf98uuRYxWGHLAwXWp8DtaEYHo4cUeExDjApMfvLJQ48Kp" -d '{"@type":"did:sov:123456789abcdefghi1234;spec/write-schema/0.6/write","name":"license","@id":"5fe766c2-80d9-4ac1-9422-6ea38cb55230","version":"0.1","attrNames":["license_num","name"]}' https://vas-team1.pdev.evernym.com/api/XNRkA8tboikwHD3x1Yh7Uz/write-schema/0.6


Returns:[j]




Write Credential Definition protocol
Write
Method: POST


URL: https://vas-team1.pdev.evernym.com/api/XNRkA8tboikwHD3x1Yh7Uz/write-cred-def/0.6


Auth Header:
"X-API-key: HZ3Ak6pj9ryFASKbA9fpwqjVh42F35UDiCLQ13J58Xoh:4Wf6JtGy9enwwXVKcUgADPq7Pnf9T2YZ8LupMEVxcQQf98uuRYxWGHLAwXWp8DtaEYHo4cUeExDjApMfvLJQ48Kp"


Data: 
{
  "@id": String, optional, random id,
  "@type": "did:sov:123456789abcdefghi1234;spec/write-cred-def/0.6/write",
  "name": String, name of cred def,
  “schemaId”: String, schema id of schema to be used,
  "tag":  String, optional, tag,
  "revocationDetails": Revocation details
}


Curl example:
curl -XPOST -v -H "X-API-key: HZ3Ak6pj9ryFASKbA9fpwqjVh42F35UDiCLQ13J58Xoh:4Wf6JtGy9enwwXVKcUgADPq7Pnf9T2YZ8LupMEVxcQQf98uuRYxWGHLAwXWp8DtaEYHo4cUeExDjApMfvLJQ48Kp" -d '{"@type":"did:sov:123456789abcdefghi1234;spec/write-cred-def/0.6/write","schemaId":"RTUnMe31CP1snzLss7RcbM:2:license:0.1","name":"cred_name1","@id":"6f8e3d2e-fb3e-4c89-8bfb-c9c3ddf94334","tag":"tag","revocationDetails":{"support_revocation":false}}' https://vas-team1.pdev.evernym.com/api/XNRkA8tboikwHD3x1Yh7Uz/write-cred-def/0.6


Returns:[k][l]




Connecting protocol[m]
Create invite[n][o]
URL: https://vas-team1.pdev.evernym.com/api/RpxmWArPfnHxtJiqWTq7Yt/connecting/0.6


Auth Header:
"X-API-key: HZ3Ak6pj9ryFASKbA9fpwqjVh42F35UDiCLQ13J58Xoh:4Wf6JtGy9enwwXVKcUgADPq7Pnf9T2YZ8LupMEVxcQQf98uuRYxWGHLAwXWp8DtaEYHo4cUeExDjApMfvLJQ48Kp"


Data:
{
"@id":String, optional, random id,
"@type":"did:sov:123456789abcdefghi1234;spec/connecting/0.6/CREATE_CONNECTION[p][q]",
"sourceId": String, can be random uuid[r][s]
"includePublicDID": Boolean, should invite include public DID
}
	

Curl example:
curl -XPOST -v -H "X-API-key: HZ3Ak6pj9ryFASKbA9fpwqjVh42F35UDiCLQ13J58Xoh:4Wf6JtGy9enwwXVKcUgADPq7Pnf9T2YZ8LupMEVxcQQf98uuRYxWGHLAwXWp8DtaEYHo4cUeExDjApMfvLJQ48Kp" -d '{"sourceId":"7d045e6d-dd32-428b-95c3-29313f5fd61c","@type":"did:sov:123456789abcdefghi1234;spec/connecting/0.6/CREATE_CONNECTION","includePublicDID":false,"@id":"f2078c98-3fa9-46d0-b47a-a67c4bb850e3"}' https://vas-team1.pdev.evernym.com/api/XNRkA8tboikwHD3x1Yh7Uz/connecting/0.6


Returns:[t]


Issue credential protocol
URL: https://vas-team1.pdev.evernym.com/api/RpxmWArPfnHxtJiqWTq7Yt/issue-credential/0.6/[<thread_id>]


Auth Header:
"X-API-key: HZ3Ak6pj9ryFASKbA9fpwqjVh42F35UDiCLQ13J58Xoh:4Wf6JtGy9enwwXVKcUgADPq7Pnf9T2YZ8LupMEVxcQQf98uuRYxWGHLAwXWp8DtaEYHo4cUeExDjApMfvLJQ48Kp"
Send offer
Data:
{
"@id":String, optional, random id,
"@type":"did:sov:123456789abcdefghi1234;spec/issue-credential/0.6/send-offer",
"~for_relationship": String, pairwise did
"name": String, Name of credential
"credDefId": String, id of credential definition used
"credentialValues": JSON, key-value pairs of credential values
"price": String, Price of credential
}
	

Curl example:
curl -XPOST -v -H "X-API-key: HZ3Ak6pj9ryFASKbA9fpwqjVh42F35UDiCLQ13J58Xoh:4Wf6JtGy9enwwXVKcUgADPq7Pnf9T2YZ8LupMEVxcQQf98uuRYxWGHLAwXWp8DtaEYHo4cUeExDjApMfvLJQ48Kp" -d '{"@type":"did:sov:123456789abcdefghi1234;spec/issue-credential/0.6/send-offer","credDefId":"KwgzAuJxWTZMJwfN7pbX6P:3:CL:104:tag","price":"0","credentialValues":{"license_num":"123","name":"Bob"},"~for_relationship":"YBXSwfA9GFgkb9xDeDvMUf","name":"credName","@id":"d430abb9-42db-484d-a3dd-d2fb282112ea"}' https://vas-team1.pdev.evernym.com/api/XNRkA8tboikwHD3x1Yh7Uz/issue-credential/0.6


Returns:[u]


Issue credential 
Data:
{
"@id":String, optional, random id,
"@type":"did:sov:123456789abcdefghi1234;spec/issue-credential/0.6/issue-credential",
"~for_relationship": String, pairwise did
}


Note: You must provide the same threadId as received in ask-accept msg.
	

Curl example:
curl -XPOST -v -H "X-API-key: HZ3Ak6pj9ryFASKbA9fpwqjVh42F35UDiCLQ13J58Xoh:4Wf6JtGy9enwwXVKcUgADPq7Pnf9T2YZ8LupMEVxcQQf98uuRYxWGHLAwXWp8DtaEYHo4cUeExDjApMfvLJQ48Kp" -d '{"@type":"did:sov:123456789abcdefghi1234;spec/issue-credential/0.6/issue-credential","~for_relationship":"YBXSwfA9GFgkb9xDeDvMUf","@id":"d430abb9-42db-484d-a3dd-d2fb282112ea"}' https://vas-team1.pdev.evernym.com/api/XNRkA8tboikwHD3x1Yh7Uz/issue-credential/0.6/2de6c8e5-37b5-4550-bbee-c3fabbcdfa47




Returns:[v]
Get status[w][x]
Data:
GET request on protocol URL with right threadId
Curl Example:
curl -v -H "X-API-key: HZ3Ak6pj9ryFASKbA9fpwqjVh42F35UDiCLQ13J58Xoh:4Wf6JtGy9enwwXVKcUgADPq7Pnf9T2YZ8LupMEVxcQQf98uuRYxWGHLAwXWp8DtaEYHo4cUeExDjApMfvLJQ48Kp" https://vas-team1.pdev.evernym.com/api/XNRkA8tboikwHD3x1Yh7Uz/issue-credential/0.6/2de6c8e5-37b5-4550-bbee-c3fabbcdfa47[y][z]




Returns:[aa]
Present proof protocol
URL: https://vas-team1.pdev.evernym.com/api/RpxmWArPfnHxtJiqWTq7Yt/present-proof/0.6/[<thread_id>]


Auth Header:
"X-API-key: HZ3Ak6pj9ryFASKbA9fpwqjVh42F35UDiCLQ13J58Xoh:4Wf6JtGy9enwwXVKcUgADPq7Pnf9T2YZ8LupMEVxcQQf98uuRYxWGHLAwXWp8DtaEYHo4cUeExDjApMfvLJQ48Kp"
Request proof
Data:
{
"@id":String, optional, random id,
"@type":"did:sov:123456789abcdefghi1234;spec/present-proof/0.6/request",
"~for_relationship": String, pairwise did
"name": String, Name of proof
"proofAttrs": JSONArray of ProofAttr, array of proof attributes
"proofPredicates": Optional, JSONArray of ProofPredicate
"revocationInterval": Optional, RevocationInterval
}


ProofAttr
{
"name": String,
"restrictions": Optional, JSONArray of restrictions (key value pair)[ab]
"non_revoked": Optional, RevocationInterval
}


ProofPredicate
{
"name": String, name of predicate
"p_type": String, type of predicate[ac]
"p_value": Int, value of predicate,[ad]
"restrictions": Optional, JSONArray of restrictions[ae]
}


RevocationInterval
{
"from": Optional, timestamp[af]
"to": Options, timestamp
}
	

	Curl example:[ag]
curl -XPOST -v -H "X-API-key: HZ3Ak6pj9ryFASKbA9fpwqjVh42F35UDiCLQ13J58Xoh:4Wf6JtGy9enwwXVKcUgADPq7Pnf9T2YZ8LupMEVxcQQf98uuRYxWGHLAwXWp8DtaEYHo4cUeExDjApMfvLJQ48Kp" -d '{"@type":"did:sov:123456789abcdefghi1234;spec/present-proof/0.6/request","proofAttrs":[{"name":"name","restrictions":[{"issuer_did":"KwgzAuJxWTZMJwfN7pbX6P"}]},{"name":"license_num","restrictions":[{"issuer_did":"KwgzAuJxWTZMJwfN7pbX6P"}]}],"~for_relationship":"YBXSwfA9GFgkb9xDeDvMUf","name":"proof-request-1","@id":"a9773296-9f8c-4b8c-8513-2fe687aeffaf"}' https://vas-team1.pdev.evernym.com/api/XNRkA8tboikwHD3x1Yh7Uz/present-proof/0.6


Returns:[ah]


Get status[ai]
Data:
GET request on protocol URL with right threadId
Curl Example:
curl -v -H "X-API-key: HZ3Ak6pj9ryFASKbA9fpwqjVh42F35UDiCLQ13J58Xoh:4Wf6JtGy9enwwXVKcUgADPq7Pnf9T2YZ8LupMEVxcQQf98uuRYxWGHLAwXWp8DtaEYHo4cUeExDjApMfvLJQ48Kp" https://vas-team1.pdev.evernym.com/api/XNRkA8tboikwHD3x1Yh7Uz/present-proof/0.6/2de6c8e5-37b5-4550-bbee-c3fabbcdfa47


Returns:[aj]


Committed Answer
URL: https://vas-team1.pdev.evernym.com/api/RpxmWArPfnHxtJiqWTq7Yt/committedanswer/1.0/[<thread_id>]


Auth Header:
"X-API-key: HZ3Ak6pj9ryFASKbA9fpwqjVh42F35UDiCLQ13J58Xoh:4Wf6JtGy9enwwXVKcUgADPq7Pnf9T2YZ8LupMEVxcQQf98uuRYxWGHLAwXWp8DtaEYHo4cUeExDjApMfvLJQ48Kp"
Ask question[ak][al]
Data:
{
"@id":String, optional, random id,
"@type":"did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/committedanswer/1.0/ask-question",
"~for_relationship": String, pairwise did
"text": String, Text of question
"detail": String, Question description
"valid_responses": JSONArray of String valid responses
"signature_required": Boolean, is signed response required?
}


	

	Curl example:
curl -XPOST -v -H "X-API-key: HZ3Ak6pj9ryFASKbA9fpwqjVh42F35UDiCLQ13J58Xoh:4Wf6JtGy9enwwXVKcUgADPq7Pnf9T2YZ8LupMEVxcQQf98uuRYxWGHLAwXWp8DtaEYHo4cUeExDjApMfvLJQ48Kp" -d '{"@type":"did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/committedanswer/1.0/ask-question","~for_relationship":"YBXSwfA9GFgkb9xDeDvMUf","@id":"3f407d11-cf36-4dbc-aafd-b06774446ef7","text":"To be or to not be?","detail":"The second classic philosophical questions","signature_required":true,"valid_responses":["be","not be"]}' https://vas-team1.pdev.evernym.com/api/XNRkA8tboikwHD3x1Yh7Uz/committedanswer/1.0


Returns:[am]


Answer question[an][ao]




Data:
{
"@id":String, optional, random id,
"@type":"did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/committedanswer/1.0/answer-question",
"~for_relationship": String, pairwise did
"response": String, Response
}


	



	Curl example:
curl -XPOST -v -H "X-API-key: HZ3Ak6pj9ryFASKbA9fpwqjVh42F35UDiCLQ13J58Xoh:4Wf6JtGy9enwwXVKcUgADPq7Pnf9T2YZ8LupMEVxcQQf98uuRYxWGHLAwXWp8DtaEYHo4cUeExDjApMfvLJQ48Kp" -d '{"@type":"did:sov:BzCbsNYhMrjHiqZDTUASHg;spec/committedanswer/1.0/answer-question","~for_relationship":"YBXSwfA9GFgkb9xDeDvMUf","@id":"3f407d11-cf36-4dbc-aafd-b06774446ef7","response":"be"}' https://vas-team1.pdev.evernym.com/api/XNRkA8tboikwHD3x1Yh7Uz/committedanswer/1.0/f0bf0f83-9e5c-4101-a745-9b4a186e586b
