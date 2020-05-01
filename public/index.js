const btnSubmit = document.getElementById('btnSubmit');
const btnFind = document.getElementById('btnFind');

function sendData() {

    if ('geolocation' in navigator) {

        navigator.geolocation.getCurrentPosition(async position => {
            const lat = position.coords.latitude;
            const lon = position.coords.longitude;
            const cxr = document.getElementById('cxr').value;
            const tariff = document.getElementById('tariff').value;
            const rule = document.getElementById('rule').value;

            if (cxr == "" || tariff == "") {

                console.log("insert carrier and tariff");

                return;
            }

            const data = { lat, lon, cxr, tariff, rule };
            const options = {
                method: 'POST',
                headers: {
                    'content-type': 'application/json'
                },
                body: JSON.stringify(data)
            };

            const response = await fetch('/api', options);
            const json = await response.json(data);

            console.log(json);

        });

    } else {

        console.log('geolocation not available');
    }

}


async function getData() {

    const cxr = document.getElementById('cxr').value;
    const tariff = document.getElementById('tariff').value;
    const rule = document.getElementById('rule').value;

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

        document.getElementById('generic').textContent = "First generic sequence: " + seq.value;

        if (rule != "") {

            //when a rule is input in the HTML we run the api getRules to look for the rule or rules

            const rulesUrl = `getRules/${cxr}/${tariff}/${rule}`;
            const ruleResponse = await fetch(rulesUrl);
            const json = await ruleResponse.json();

            console.log(json);

            //first we remove the body element
            var element = document.getElementById('body');
            element.parentNode.removeChild(element);

            // now we create it again

            var tableRef = document.getElementById('myTable');

            var tableBody = document.createElement('tbody');

            tableBody.setAttribute('id', 'body');

            tableRef.appendChild(tableBody);


            for (var item of json) {

                var newrow = tableBody.insertRow();

                var newcell = newrow.insertCell(0);
                var newtext = document.createTextNode(item.cxr);
                newcell.appendChild(newtext);

                newcell = newrow.insertCell(1);
                newtext = document.createTextNode(item.tariff);
                newcell.appendChild(newtext);

                newcell = newrow.insertCell(2);
                newtext = document.createTextNode(item.seq);
                newcell.appendChild(newtext);

                newcell = newrow.insertCell(3);
                newtext = document.createTextNode(item.rule);
                newcell.appendChild(newtext);

                newcell = newrow.insertCell(4);
                newtext = document.createTextNode(item.app);
                newcell.appendChild(newtext);

                newcell = newrow.insertCell(5);
                newtext = document.createTextNode(new Date(item.date).toLocaleString());
                newcell.appendChild(newtext);
            }
        }
    }
}

// btnSubmit.addEventListener('click', sendData);
btnFind.addEventListener('click', getData);