const btnSubmit = document.getElementById('btnSubmit');
const btnFind = document.getElementById('btnFind');

async function getData() {

    const cxr = document.getElementById('cxr').value.toUpperCase();
    const tariff = document.getElementById('tariff').value.toUpperCase();
    const rule = document.getElementById('rule').value.toUpperCase();

    //we call the function to clean the page
    cleanPage();

    const data = { cxr, tariff, rule };
    // const options = {
    //     method: 'POST',
    //     headers: {
    //         'content-type': 'application/json'
    //     },
    //     body: JSON.stringify(data)
    // };


    if (data.length == 0) {

        console.log("there is no data");

    } else {

        // we call first the api getGen to get the generic sequence (ONLY ONE value is expected)
        const genUrl = `getGeneric/${cxr}/${tariff}`;
        const genResponse = await fetch(genUrl);
        const seq = await genResponse.json();

        console.log(seq);
        console.log(seq.message);

        document.getElementById('messageGeneric').textContent = seq.message;

        document.getElementById('generic').textContent = "First generic sequence: " + seq.value;

        if (rule != "") {

            //when a rule is input in the HTML we run the api getRules to look for the rule or rules

            const rulesUrl = `getRules/${cxr}/${tariff}/${rule}`;
            const ruleResponse = await fetch(rulesUrl);
            const json = await ruleResponse.json();

            console.log(json);

            document.getElementById('messageRules').textContent = json.message;

            // here we create the table and rows

            var tableRef = document.getElementById('myTable');

            var tableBody = document.createElement('tbody');

            tableBody.setAttribute('id', 'body');

            tableRef.appendChild(tableBody);


            for (var item of json.docs.rows) {

                var newrow = tableBody.insertRow();

                var newcell = newrow.insertCell(0);
                var newtext = document.createTextNode(item[0]);
                newcell.appendChild(newtext);

                newcell = newrow.insertCell(1);
                newtext = document.createTextNode(item[1]);
                newcell.appendChild(newtext);

                newcell = newrow.insertCell(2);
                newtext = document.createTextNode(item[2]);
                newcell.appendChild(newtext);

                newcell = newrow.insertCell(3);
                newtext = document.createTextNode(item[3]);
                newcell.appendChild(newtext);

                newcell = newrow.insertCell(4);
                newtext = document.createTextNode(item[4]);
                newcell.appendChild(newtext);

                newcell = newrow.insertCell(5);
                newtext = document.createTextNode(new Date(item[5]).toLocaleString());
                newcell.appendChild(newtext);
            }
        }
    }
}

function cleanPage() {

    document.getElementById('messageGeneric').textContent = "";
    document.getElementById('messageRules').textContent = "";


    var element = document.getElementById('body');

    if (element != null) {

        element.parentNode.removeChild(element);
    }

}

// btnSubmit.addEventListener('click', sendData);
btnFind.addEventListener('click', getData);


// ***************** functions not in use ***************************

// function sendData() {

//     if ('geolocation' in navigator) {

//         navigator.geolocation.getCurrentPosition(async position => {
//             const lat = position.coords.latitude;
//             const lon = position.coords.longitude;
//             const cxr = document.getElementById('cxr').value;
//             const tariff = document.getElementById('tariff').value;
//             const rule = document.getElementById('rule').value;

//             if (cxr == "" || tariff == "") {

//                 console.log("insert carrier and tariff");

//                 return;
//             }

//             const data = { lat, lon, cxr, tariff, rule };
//             const options = {
//                 method: 'POST',
//                 headers: {
//                     'content-type': 'application/json'
//                 },
//                 body: JSON.stringify(data)
//             };

//             const response = await fetch('/api', options);
//             const json = await response.json(data);

//             console.log(json);

//         });

//     } else {

//         console.log('geolocation not available');
//     }

// }