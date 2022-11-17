const DARK_COLOR = "#6c757d"
const LIGHT_COLOR = "#fff"
let SEARCH_TYPE = 1
let ADVANCED_SEARCH = false
let ADVANCED_SET = false
let ACTIVE_BUTTONS = {}

const NONCOMPLEX_ATTRS = ["autor_upisa", "prostor", "datum", "vrijeme", "zamjena_sudionika", "sudionik1", "sudionik2", "situacijski_kontekst"]

const EXVOCATION_GREETING = "exv_poz"
const INVOCATION_GREETING = "inv_poz"
const EXVOCATION_RESPONSE = "exv_odz"
const INVOCAITON_RESPONSE = "inv_odz"

const GREETING = "pozdrav"
const RESPONSE = "odgovor"
const UNDEFINED = 'undefined'
const REST = "ostalo"

const FIRST_PARTICIPANT = "sudionik1"
const SECOND_PARTICIPANT = "sudionik2"

const EMOTION_IPN = "emocija_ipn"
const EMOTION_ION = "emocija_ion"
const EMOTION_IPV = "emocija_ipv"
const EMOTION_IOV = "emocija_iov"

const EMOTION_EPN = "emocija_epn"
const EMOTION_EON = "emocija_eon"
const EMOTION_EPV = "emocija_epv"
const EMOTION_EOV = "emocija_eov"

const DESCRIPTION_IPN = "opis_ipn"
const DESCRIPTION_ION = "opis_ion"
const DESCRIPTION_IPV = "opis_ipv"
const DESCRIPTION_IOV = "opis_iov"

const DESCRIPTION_EPN = "opis_epn"
const DESCRIPTION_EON = "opis_eon"
const DESCRIPTION_EPV = "opis_epv"
const DESCRIPTION_EOV = "opis_eov"

const REST_ATTR = "ostalo"
const REST_ATTRS = {
    inv_poz : ["opis_ipv_ostalo", "opis_ipn_ostalo"],
    exv_odz : ["opis_eon_ostalo", "opis_eov_ostalo"], 
    inv_odz : ["opis_iov_ostalo", "opis_ion_ostalo"], 
    exv_poz : ["opis_epn_ostalo", "opis_epv_ostalo"]
}

const HTML_CARD_HEADER = '<div class="card-body" id="$$">'
const HTML_CARD_FOOTER = '<div class="card-footer"><small class="text-muted">Autor: $$</small></div></div>'
const HTML_REST = '<p class="card-text"><span>ostalo</span>'


$.ajax({
    url: "/dict"
}).done((data) => {
    localStorage.setItem("attr", JSON.stringify(data))
})

$.ajax({
    url: "/return"
}).done((data) => {
    localStorage.setItem("data", JSON.stringify(data))
})

const DATA = JSON.parse(JSON.parse(localStorage['data']))

$("#inv-exv").on("click", () => {
    if($("#inv-exv").text() === "Invokacija"){
        $("#inv-exv").text("Eksvokacija")
        $("#inv-exv").css("background-color", DARK_COLOR)
        $("#inv-exv").css("color", LIGHT_COLOR)
        SEARCH_TYPE = 1
    }
    else{
        $("#inv-exv").text("Invokacija")
        $("#inv-exv").css("background-color", LIGHT_COLOR)
        $("#inv-exv").css("color", DARK_COLOR)
        SEARCH_TYPE = 2
    }
})


function searchNonComplexAttr(event, keys){
    for(key in keys){
        if(typeof event[key] !== 'undefined'){
            const inputValue = $(`${attrName}-input`).val()
            if(event[key].includes(inputValue))
                return true
        }
    }
    return false
}

function attributeSearch(j){
    let keys = []
    let returnEntries = {}
    let nonComplex = true

    // Treba napraviti da ide od kljuca do kljuca i trazi podate iz j
    for (button in ACTIVE_BUTTONS){
        if(ACTIVE_BUTTONS[button]){
            key = button.split("-button")[0]
            if(!NONCOMPLEX_ATTRS.includes(key))
                nonComplex = false
            keys.push(key)
        }
    }
    
    for(key in j){
        let matches = true
        let restMatches = false
        let restNeeded = false
        
        for(index in keys){
            const attr = keys[index]
            const inputValue = $(`#${attr}-input`).val()
            if(NONCOMPLEX_ATTRS.includes(attr)){
                if(typeof j[key][attr] === 'undefined' || !j[key][attr].includes(inputValue))
                    matches = false          
            }
            else{
                if(attr === REST_ATTR){
                    restNeeded = true
                    for(restKey in REST_ATTRS){
                        for(index in REST_ATTRS[restKey]){
                            restAttr = REST_ATTRS[restKey][index]
                            if(typeof j[key][restKey] !== 'undefined' && typeof j[key][restKey][restAttr] !== 'undefined' && j[key][restKey][restAttr].includes(inputValue))
                                restMatches = true
                        }
                    }
                }
                else{
                    const attrId = attr.split("_")[1]
                    const exvocation = attrId.includes("e")
                    const greeting = attrId.includes("p")
                    if(exvocation){
                        if(greeting){
                            if(typeof j[key][EXVOCATION_GREETING] === 'undefined' || typeof j[key][EXVOCATION_GREETING][attr] === 'undefined' || !j[key][EXVOCATION_GREETING][attr].includes(inputValue))
                                matches = false 
                        }
                        else{
                            if(typeof j[key][EXVOCATION_RESPONSE] === 'undefined' || typeof j[key][EXVOCATION_RESPONSE][attr] === 'undefined' || !j[key][EXVOCATION_RESPONSE][attr].includes(inputValue))
                                matches = false 
                        }
                    }
                    else{
                        if(greeting){
                            if(typeof j[key][INVOCATION_GREETING] === 'undefined' || typeof j[key][INVOCATION_GREETING][attr] === 'undefined' || !j[key][INVOCATION_GREETING][attr].includes(inputValue))
                                matches = false 
                        }
                        else{
                            if(typeof j[key][INVOCAITON_RESPONSE] === 'undefined' || typeof j[key][INVOCAITON_RESPONSE][attr] === 'undefined' || !j[key][INVOCAITON_RESPONSE][attr].includes(inputValue))
                                matches = false 
                        }
                    }
                }
                
            }
        }
        if(matches && ((restNeeded && restMatches) || (!restMatches & !restNeeded)))
            returnEntries[key] = j[key]
    }
    return returnEntries
}

function returnInvocationCard(j, key){
    const invocationGreeting = j[key]["inv_poz"]
    const invocationResponse = j[key]["inv_odz"]

    attrString = ""
    restString = ""
    rest = '<p class="card-text"><span>ostalo</span>'

    ipnEmotion = ""
    ipvEmotion = ""
    ipnDescription = ""
    ipvDescription = ""

    for(attrKey in invocationGreeting){
        if(attrKey !== "pozdrav"){
            if(attrKey.includes("ostalo")){
                if(invocationGreeting[attrKey].length >2 )
                    restString += ` | ${invocationGreeting[attrKey]}`
            }
            else{
                if(attrKey === "emocija_ipn")
                    ipnEmotion = invocationGreeting[attrKey]
                else if(attrKey === "emocija_ipv")
                    ipvEmotion = invocationGreeting[attrKey]
                else if(attrKey === "opis_ipv")
                    ipvDescription = invocationGreeting[attrKey]
                else if(attrKey === "opis_ipn")
                    ipnDescription = invocationGreeting[attrKey]
            }
        }
    }
    if (restString !== ""){
        restString = rest + restString + "</p>"
    }
    if(ipnDescription === "0" || ipnDescription === "")
        ipnDescription = "Nepoznato"
    if(ipvDescription === "0" || ipvDescription === "")
        ipvDescription = "Nepoznato"
    if(ipnEmotion === "" || ipnEmotion === "0")
        ipnEmotion = "Nepoznato"
    if(ipvEmotion === "" || ipvEmotion === "0")
        ipvEmotion = "Nepoznato"

    attrString = `<p class="card-text">${ipnDescription} [${ipnEmotion}]<br>${ipvDescription} [${ipvEmotion}]</p>`
    greetingElement = `<h5 class="card-title"><span class='notbold'>${j[key]["sudionik1"]}:</span> ${j[key]["inv_poz"]["pozdrav"]}</h5><hr>
    ${attrString}       
    ${restString}`
    
    restString = ""
    ionEmotion = ""
    iovEmotion = ""
    ionDescription = ""
    iovDescritpion = ""
    responseElement = ""
    
    if(typeof invocationResponse !== "undefined" && typeof invocationResponse["odgovor"] !== "undefined"){
        for(attrKey in invocationResponse){
            if(attrKey !== "odgovor"){
                if(attrKey.includes("ostalo")){
                    if(invocationResponse[attrKey].length >2 )
                        restString += ` | ${invocationResponse[attrKey]}`
                }
                else{
                    if(attrKey === "emocija_ion")
                        ionEmotion = invocationResponse[attrKey]
                    else if(attrKey === "emocija_iov")
                        iovEmotion = invocationResponse[attrKey]
                    else if(attrKey === "opis_ion")
                        ionDescription = invocationResponse[attrKey]
                    else if(attrKey === "opis_iov")
                        iovDescritpion = invocationResponse[attrKey]
                }
            }
        }
        if (restString !== ""){
            restString = rest + restString + "</p>"
        }
        if(iovDescritpion === "0" || iovDescritpion === "")
            iovDescritpion = "Nepoznato"
        if(ionDescription === "0" || ionDescription === "")
            ionDescription = "Nepoznato"
        if(ionEmotion === "" || ionEmotion === "0")
            ionEmotion = "Nepoznato"
        if(iovEmotion === "" ||iovEmotion === "0")
            iovEmotion = "Nepoznato"
        
        attrString = `<p class="card-text">${ionDescription} [${ionEmotion}]<br>${iovDescritpion} [${iovEmotion}]</p>`
        responseElement =  `<h5 class="card-title"><span class='notbold'>${j[key]["sudionik2"]}:</span> ${j[key]["inv_odz"]["odgovor"]}</h5><hr>
        ${attrString}
        ${restString}`
    }
    
    if(typeof j[key]["autor_upisa"] === 'undefined')
        autor_upisa = "Nepoznato"
    else 
        autor_upisa = j[key]["autor_upisa"]
    htmlString = `
            <div class="card-body" id="invocation">
                ${greetingElement}
                ${responseElement}
                <small class="text-muted">INVOKACIJA | ${j[key]["prostor"]} | ${j[key]["datum"]} | ${j[key]["vrijeme"]}</small>
                <div class="card-footer">
                    <small class="text-muted">Autor: ${autor_upisa}</small>
                </div>
            </div>`
    return htmlString
}

function changeUnknownValues(value){
    if (value === '0' || value === '' ||value === 'Ø' || typeof value === UNDEFINED)
        return "Nepoznato"
    return value
}

function returnRestAttributes(restString){
    s = restString
    for(attr in INVOCATION_KOMB_DICTIONARY){
        if(restString.includes(attr)){
            s = s.replace(attr, INVOCATION_KOMB_DICTIONARY[attr])
        }
    }
    return s
}

function returnCardAttrs(entryParameter, greetingFlag){
    attrString = ""
    let restString = ""
    let rest = '<p class="card-text"><span>ostalo</span>'

    nonverbalDescritpion = ""
    nonverbalEmotion = ""
    verbalDescription = ""
    verbalEmotion = ""

    let greetingNonverbalEmotion =  ""
    let responseNonverbalEmotion =  ""
    let responseVerbalEmotion =  ""
    let greetingVerbalEmotion =  ""
    let greetingNonverbalDescription = ""
    let responseNonverbalDescription = ""
    let responseVerbalDescription =  ""
    let greetingVerbalDescription =  ""

    for(attrKey in entryParameter){
        if(attrKey !== GREETING){
            if(attrKey.includes(REST)){
                if(entryParameter[attrKey].length >2 )
                    restString += ` | ${returnRestAttributes(entryParameter[attrKey])}`
                    // restString += ` | ${entryParameter[attrKey]}`

            }
            else{
                if(attrKey === EMOTION_IPN || attrKey === EMOTION_EPN)
                    greetingNonverbalEmotion = entryParameter[attrKey]
                else if(attrKey === EMOTION_EON || attrKey === EMOTION_ION)
                    responseNonverbalEmotion = entryParameter[attrKey]
                else if(attrKey === EMOTION_EOV || attrKey === EMOTION_IOV)
                    responseVerbalEmotion = entryParameter[attrKey]
                else if(attrKey === EMOTION_IPV || attrKey === EMOTION_EPV)
                    greetingVerbalEmotion = entryParameter[attrKey]
                else if(attrKey === DESCRIPTION_IPN || attrKey === DESCRIPTION_EPN)
                    greetingNonverbalDescription = entryParameter[attrKey]
                else if(attrKey === DESCRIPTION_EON || attrKey === DESCRIPTION_ION)
                    responseNonverbalDescription = entryParameter[attrKey]
                else if(attrKey === DESCRIPTION_EOV || attrKey === DESCRIPTION_IOV)
                    responseVerbalDescription = entryParameter[attrKey]
                else if(attrKey === DESCRIPTION_IPV || attrKey === DESCRIPTION_EPV)
                    greetingVerbalDescription = entryParameter[attrKey]
            }
            }
            if(greetingFlag){
                nonverbalDescritpion = changeUnknownValues(greetingNonverbalDescription)
                nonverbalEmotion = changeUnknownValues(greetingNonverbalEmotion)
                verbalDescription = changeUnknownValues(greetingVerbalDescription)
                verbalEmotion = changeUnknownValues(greetingVerbalEmotion)
            }
            else{
                nonverbalDescritpion = changeUnknownValues(responseNonverbalDescription)
                nonverbalEmotion = changeUnknownValues(responseNonverbalEmotion)
                verbalDescription = changeUnknownValues(responseVerbalDescription)
                verbalEmotion = changeUnknownValues(responseVerbalEmotion)
            }
        }
        if (restString !== ""){
            restString = rest + restString + "</p>"
    }
    return [verbalDescription, verbalEmotion, nonverbalDescritpion, nonverbalEmotion, restString]
}

function returnCardGreeting(entryParameter, invocation){
    try{
        firstParticipant = changeUnknownValues(entryParameter[FIRST_PARTICIPANT])
        secondParticipant = changeUnknownValues(entryParameter[SECOND_PARTICIPANT])
        if(invocation){
            if(typeof entryParameter[INVOCATION_GREETING] !== UNDEFINED)
                greeting = changeUnknownValues(entryParameter[INVOCATION_GREETING][GREETING])
            else 
                response = "Nepoznato"
            if(typeof entryParameter[INVOCAITON_RESPONSE] !== UNDEFINED)
                response = changeUnknownValues(entryParameter[INVOCAITON_RESPONSE][RESPONSE])
            else 
                response = "Nepoznato"
        }
        else{
            if(typeof entryParameter[EXVOCATION_GREETING] !== UNDEFINED)
                greeting = changeUnknownValues(entryParameter[EXVOCATION_GREETING][GREETING])
            else 
                response = "Nepoznato"
            if(typeof entryParameter[EXVOCATION_RESPONSE] !== UNDEFINED)
                response = changeUnknownValues(entryParameter[EXVOCATION_RESPONSE][RESPONSE])
        }
        greetingElement = `<h5 class="card-title"><span class='notbold'>${firstParticipant}:</span> ${greeting}</h5><hr>`
        responseElement = `<h5 class="card-title"><span class='notbold'>${secondParticipant}:</span> ${response}</h5><hr>`
        
        return [greetingElement, responseElement]
    }
    catch(error){
        console.log(error)
        console.log(entryParameter)
    }
    
}

function returnCardHtml(entryParameter, invocation, flags){
    [greetingHtml, responseHtml] = returnCardGreeting(entryParameter, invocation);
    [vDescription, vEmotion, nvDescritpion, nvEmotion, rest] = returnCardAttrs(entryParameter[flags[0]], true)
    attrString = returnCardAttribute(nvDescritpion, nvEmotion, vDescription, vEmotion)
    greetingHtml = greetingHtml + attrString + rest;
    [vDescription, vEmotion, nvDescritpion, nvEmotion, rest] = returnCardAttrs(entryParameter[flags[1]], false)
    attrString = returnCardAttribute(nvDescritpion, nvEmotion, vDescription, vEmotion)
    responseHtml = responseHtml + attrString + rest;
    return [greetingHtml, responseHtml]
}

function returnIfMatch(entryParameter, searchData, greetingAttr){
    htmlString = ""
    if(typeof entryParameter !== UNDEFINED && typeof entryParameter[greetingAttr] !== UNDEFINED){
        if(entryParameter[greetingAttr].includes(searchData) || searchData === ""){
            return `<h5 class="card-title" id="header-match">${returnBoldAttr(entryParameter[greetingAttr]).replace(":", "")}</h5><hr>`
        }
    }
    return false
}

function addInvocations(entry, searchData){
    const invocationGreeting = entry[INVOCATION_GREETING]
    const invocationResponse = entry[INVOCAITON_RESPONSE]

    htmlString =""
    if(typeof invocationGreeting!== 'undefined' && typeof invocationGreeting["pozdrav"] !== 'undefined'){
        
        attrString = ""
        restString = ""
        rest = '<p class="card-text"><span>ostalo</span>'
        ipnEmotion = ""
        ipvEmotion = ""
        ipnDescription = ""
        ipvDescription = ""

        if(invocationGreeting["pozdrav"].includes(searchData) || searchData === ""){
            attrString = ""
            restString = ""
            rest = '<p class="card-text"><span>ostalo</span>'

            ipnEmotion = ""
            ipvEmotion = ""
            ipnDescription = ""
            ipvDescription = ""

            for(attrKey in invocationGreeting){
                if(attrKey !== "pozdrav"){
                    if(attrKey.includes("ostalo")){
                        if(invocationGreeting[attrKey].length >2 )
                            restString += ` | ${invocationGreeting[attrKey]}`
                    }
                    else{
                        if(attrKey === "emocija_ipn")
                            ipnEmotion = invocationGreeting[attrKey]
                        else if(attrKey === "emocija_ipv")
                            ipvEmotion = invocationGreeting[attrKey]
                        else if(attrKey === "opis_ipv")
                            ipvDescription = invocationGreeting[attrKey]
                        else if(attrKey === "opis_ipn")
                            ipnDescription = invocationGreeting[attrKey]
                    }
                }
            }
            if (restString !== ""){
                restString = rest + restString + "</p>"
            }
            if(ipnDescription === "0" || ipnDescription === "")
                ipnDescription = "Nepoznato"
            if(ipvDescription === "0" || ipvDescription === "")
                ipvDescription = "Nepoznato"
            if(ipnEmotion === "" || ipnEmotion === "0")
                ipnEmotion = "Nepoznato"
            if(ipvEmotion === "" || ipvEmotion === "0")
                ipvEmotion = "Nepoznato"

            attrString = `<p class="card-text">${ipnDescription} [${ipnEmotion}]<br>${ipvDescription} [${ipvEmotion}]</p>`
            greetingElement = `<h5 class="card-title"><span class='notbold'>${j[key]["sudionik1"]}:</span> ${j[key]["inv_poz"]["pozdrav"]}</h5><hr>
            ${attrString}       
            ${restString}`
            
            restString = ""
            ionEmotion = ""
            iovEmotion = ""
            ionDescription = ""
            iovDescritpion = ""
            responseElement = ""
            
            if(typeof invocationResponse !== "undefined" && typeof invocationResponse["odgovor"] !== "undefined"){
                for(attrKey in invocationResponse){
                    if(attrKey !== "odgovor"){
                        if(attrKey.includes("ostalo")){
                            if(invocationResponse[attrKey].length >2 )
                                restString += ` | ${invocationResponse[attrKey]}`
                        }
                        else{
                            if(attrKey === "emocija_ion")
                                ionEmotion = invocationResponse[attrKey]
                            else if(attrKey === "emocija_iov")
                                iovEmotion = invocationResponse[attrKey]
                            else if(attrKey === "opis_ion")
                                ionDescription = invocationResponse[attrKey]
                            else if(attrKey === "opis_iov")
                                iovDescritpion = invocationResponse[attrKey]
                        }
                    }
                }
                if (restString !== ""){
                    restString = rest + restString + "</p>"
                }
                if(iovDescritpion === "0" || iovDescritpion === "")
                    iovDescritpion = "Nepoznato"
                if(ionDescription === "0" || ionDescription === "")
                    ionDescription = "Nepoznato"
                if(ionEmotion === "" || ionEmotion === "0")
                    ionEmotion = "Nepoznato"
                if(iovEmotion === "" ||iovEmotion === "0")
                    iovEmotion = "Nepoznato"
                
                attrString = `<p class="card-text">${ionDescription} [${ionEmotion}]<br>${iovDescritpion} [${iovEmotion}]</p>`
                responseElement =  `<h5 class="card-title"><span class='notbold'>${j[key]["sudionik2"]}:</span> ${j[key]["inv_odz"]["odgovor"]}</h5><hr>
                ${attrString}
                ${restString}`
            }
            
            if(typeof j[key]["autor_upisa"] === 'undefined')
                autor_upisa = "Nepoznato"
            else 
                autor_upisa = j[key]["autor_upisa"]
            
            htmlString += `
                    <div class="card-body" id="invocation">
                        ${greetingElement}
                        ${responseElement}
                        <small class="text-muted">INVOKACIJA | ${j[key]["prostor"]} | ${j[key]["datum"]} | ${j[key]["vrijeme"]}</small>
                        <div class="card-footer">
                            <small class="text-muted">Autor: ${autor_upisa}</small>
                        </div>
                    </div>`
        }
    }
    else{
        console.log("1")
    }
    return htmlString
}

function addExvocations(j, key){
    
    const exvocationGreeting = j[key]["exv_poz"]
    const exvocationResponse = j[key]["exv_odz"]
    htmlString = ""
    if(typeof exvocationGreeting !== 'undefined' && typeof exvocationGreeting["pozdrav"] !== 'undefined'){
        attrString = ""
        restString = ""
        rest = '<p class="card-text"><span>ostalo</span>'
        ipnEmotion = ""
        ipvEmotion = ""
        ipnDescription = ""
        ipvDescription = ""

            attrString = ""
            restString = ""
            rest = '<p class="card-text"><span>ostalo</span>'

            ipnEmotion = ""
            ipvEmotion = ""
            ipnDescription = ""
            ipvDescription = ""

            for(attrKey in exvocationGreeting){
                if(attrKey !== "pozdrav"){
                    if(attrKey.includes("ostalo")){
                        if(exvocationGreeting[attrKey].length >2 )
                            restString += ` | ${exvocationGreeting[attrKey]}`
                    }
                    else{
                        if(attrKey === "emocija_epn")
                            ipnEmotion = exvocationGreeting[attrKey]
                        else if(attrKey === "emocija_epv")
                            ipvEmotion = exvocationGreeting[attrKey]
                        else if(attrKey === "opis_epv")
                            ipvDescription = exvocationGreeting[attrKey]
                        else if(attrKey === "opis_epn")
                            ipnDescription = exvocationGreeting[attrKey]
                    }
                }
            }
            if (restString !== ""){
                restString = rest + restString + "</p>"
            }
            if(ipnDescription === "0" || ipnDescription === "")
                ipnDescription = "Nepoznato"
            if(ipvDescription === "0" || ipvDescription === "" )
                ipvDescription = "Nepoznato"
            if(ipnEmotion === "" || ipnEmotion === "0")
                ipnEmotion = "Nepoznato"
            if(ipvEmotion === "" || ipvEmotion === "0")
                ipvEmotion = "Nepoznato"

            attrString = `<p class="card-text">${ipnDescription} [${ipnEmotion}]<br>${ipvDescription} [${ipvEmotion}]</p>`
            if(typeof j[key]["zamjena_sudionika"] !== 'undefined' && j[key]["zamjena_sudionika"] === "da")
                greetingElement = `<h5 class="card-title"><span class='notbold'>${j[key]["sudionik2"]}:</span> ${j[key]["exv_poz"]["pozdrav"]}</h5><hr>
                ${attrString}       
                ${restString}`
            
            else               
                greetingElement = `<h5 class="card-title"><span class='notbold'>${j[key]["sudionik1"]}:</span> ${j[key]["exv_poz"]["pozdrav"]}</h5><hr>
                ${attrString}       
                ${restString}`
            
            restString = ""
            ionEmotion = ""
            iovEmotion = ""
            ionDescription = ""
            iovDescritpion = ""
            responseElement = ""
            
            if(typeof exvocationResponse !== "undefined" && typeof exvocationResponse["odgovor"] !== "undefined"){
                for(attrKey in exvocationResponse){
                    if(attrKey !== "odgovor"){
                        if(attrKey.includes("ostalo")){
                            if(exvocationResponse[attrKey].length >2 )
                                restString += ` | ${exvocationResponse[attrKey]}`
                        }
                        else{
                            if(attrKey === "emocija_eon")
                                ionEmotion = exvocationResponse[attrKey]
                            else if(attrKey === "emocija_eov")
                                iovEmotion = exvocationResponse[attrKey]
                            else if(attrKey === "opis_eon")
                                ionDescription = exvocationResponse[attrKey]
                            else if(attrKey === "opis_eov")
                                iovDescritpion = exvocationResponse[attrKey]
                        }
                    }
                }
                if (restString !== ""){
                    restString = rest + restString + "</p>"
                }
                if(iovDescritpion === "0" || iovDescritpion === "")
                    iovDescritpion = "Nepoznato"
                if(ionDescription === "0" || ionDescription === "")
                    ionDescription = "Nepoznato"
                if(ionEmotion === "" || ionEmotion === "0")
                    ionEmotion = "Nepoznato"
                if(iovEmotion === "" ||iovEmotion === "0")
                    iovEmotion = "Nepoznato"
                
                attrString = `<p class="card-text">${ionDescription} [${ionEmotion}]<br>${iovDescritpion} [${iovEmotion}]</p>`

                if(typeof j[key]["zamjena_sudionika"] !== 'undefined' && j[key]["zamjena_sudionika"] === "da")
                    responseElement =  `<h5 class="card-title"><span class='notbold'>${j[key]["sudionik1"]}:</span> ${j[key]["exv_odz"]["odgovor"]}</h5><hr>
                    ${attrString}
                    ${restString}`
                else 
                    responseElement =  `<h5 class="card-title"><span class='notbold'>${j[key]["sudionik2"]}:</span> ${j[key]["exv_odz"]["odgovor"]}</h5><hr>
                    ${attrString}
                    ${restString}`
            }
            if(typeof j[key]["autor_upisa"] === 'undefined')
                autor_upisa = "Nepoznato"
            else 
                autor_upisa = j[key]["autor_upisa"]
        
            
            htmlString += `
                    <div class="card-body" id="exvocation">
                        ${greetingElement}
                        ${responseElement}
                        <small class="text-muted">EKSVOKACIJA | ${j[key]["prostor"]} | ${j[key]["datum"]} | ${j[key]["vrijeme"]}</small>
                        <div class="card-footer">
                            <small class="text-muted">Autor: ${autor_upisa}</small>
                        </div>
                    </div>`
    }
    return htmlString
}

let usedKeys = []

function addListeners(key){
    $(`#${key}`).on('click', function(){
        console.log("Kurac mali")
        if($(`#${key}-small`).css("display") === "none"){
            console.log("Nije vidljiv")
            $(`#${key}-small`).css("display", "block")
            $(`#${key}-large`).css("display", "none")
        }
        
        else{
            $(`#${key}-large`).css("display", "block")
            $(`#${key}-small`).css("display", "none")
        }
    })
}

function search(){
    const searchData = $("#main-search-input").val()
    // let k = {}
    $("#dictionary-content").contents().remove()
    // if(ADVANCED_SEARCH){
    //     k = attributeSearch(j)
    //     j = k
    // }
    let index = 0
    for(key in DATA){
        let html = ''
        let footer = ''
        let author = DATA[key]['autor_upisa']
        if(typeof author === UNDEFINED)
            author = "Nepoznato"

        invocationGreeting = DATA[key][INVOCATION_GREETING]
        invocationResponse = DATA[key][INVOCAITON_RESPONSE]
        exvocationGreeting = DATA[key][EXVOCATION_GREETING]
        exvocationResponse = DATA[key][EXVOCATION_RESPONSE]
        
        invocationGreetingMatch = returnIfMatch(invocationGreeting, searchData, GREETING)
        invocationResponseMatch = returnIfMatch(invocationResponse, searchData, RESPONSE)
        exvocationGreetingMatch = returnIfMatch(exvocationGreeting, searchData, GREETING)
        exvocationResponseMatch = returnIfMatch(exvocationResponse, searchData, RESPONSE)
        
        if(invocationGreetingMatch || invocationResponseMatch || exvocationGreetingMatch ||exvocationResponseMatch){
            let type = ""
            html = HTML_CARD_HEADER.replace("$$", `${key}-small`)
            if(invocationGreetingMatch){
                type = "INVOKACIJA"
                if(exvocationGreetingMatch || exvocationResponseMatch)
                    type = "INVOKACIJA | EKSVOKACIJA"
                html += invocationGreetingMatch
            }
            else if(invocationResponseMatch){
                type = "INVOKACIJA"
                if(exvocationGreetingMatch || exvocationResponseMatch)
                    type = "INVOKACIJA | EKSVOKACIJA"
                html += invocationResponseMatch
            }
            else if(exvocationGreetingMatch){
                type = "EKSVOKACIJA"
                html += exvocationGreetingMatch
            }
            else if(exvocationResponseMatch){
                type = "EKSVOKACIJA"
                html += exvocationResponseMatch
            }
            
            footer = `
            <small class="text-muted">${type} | ${DATA[key]["prostor"]} | ${DATA[key]["datum"]} | ${DATA[key]["vrijeme"]}</small>
            <div class="card-footer">
                <small class="text-muted">Autor: ${author}</small>
            </div>`
            html += footer
        }

        if(html !== ""){
            
            // invocationGreeting = changeUnknownValues(invocationGreeting)
            // invocationResponse = changeUnknownValues(invocationResponse)
            // exvocationGreeting = changeUnknownValues(exvocationGreeting)
            // exvocationResponse = changeUnknownValues(exvocationResponse)
            [greeting, response] = returnCardHtml(DATA[key], true, [INVOCATION_GREETING, INVOCAITON_RESPONSE])
            const invocationData = greeting+response;
            [greeting, response] = returnCardHtml(DATA[key], false, [EXVOCATION_GREETING, EXVOCATION_RESPONSE])
            const exvocationData = greeting + response;

            if (index%2 === 0){
                index += 1
                $("#dictionary-content").append(`<div class="row" id="row_${index}"><div class="col-sm-6"><div class="card bg-light mb-3" id="${key}">${html}</div><div class="card-body large" id="${key}-large">${invocationData}${exvocationData}${footer}</div></div></div></div>`)
                addListeners(key)
            }
            else{
                $(`#row_${index}`).append(`<div class="col-sm-6"><div class="card bg-light mb-3" id="${key}">${html}</div><div class="card-body large" id="${key}-large">${invocationData}${exvocationData}${footer}</div></div></div>`)
                addListeners(key)
                index += 1
            }
        }
    } 
    let notify = new Notification()
    if(index === 0){
          notify.addNotification({
            type: "error",
            title: "Greška",
            message: "Navedeni parametri ne postoje u riječniku!"
          });
    }
    else{
        notify.addNotification({
            type: "success",
            title: "Uspjeh",
            message: `Pronađeno je ${index} zapisa!`
        });
    }
}

$("#main-search-input").on('keypress',function(e) {
    if(e.which == 13) {
        $("#divider").css("display", "inline")
        search();
    }
});

function addButtonListener(id){
    ACTIVE_BUTTONS[id] = false
    $(`#${id}`).on('click', () =>{
        if(ACTIVE_BUTTONS[id]){
            $(`#${id}`).css("background-color", LIGHT_COLOR)
            $(`#${id}`).css("color", DARK_COLOR)
            ACTIVE_BUTTONS[id] = false
        }
        else{
            $(`#${id}`).css("background-color", DARK_COLOR)
            $(`#${id}`).css("color", LIGHT_COLOR)
            ACTIVE_BUTTONS[id] = true
        }

    })
}

$("#advanced-button").on('click', ()=>{
    if(ADVANCED_SEARCH){
        $("#advanced-button").css("background-color", LIGHT_COLOR)
        $("#advanced-button").css("color", DARK_COLOR)
        $("#advanced").css("display", "none")
        $("#inv-exv").css("display", "none")
        ADVANCED_SEARCH = false
    }
    else{
        $("#inv-exv").css("display", "")
        $("#advanced-button").css("background-color", DARK_COLOR)
        $("#advanced-button").css("color", LIGHT_COLOR)
        $("#inv-exv").css("display", "inline-block")
        if(ADVANCED_SET){
            $("#advanced").css("display", "inline")
            ADVANCED_SEARCH = true
        }
    
        else{
            j = JSON.parse(JSON.parse(localStorage.getItem("attr")))
            index = 0
            for(key in j){
                let htmlString = ""
                if(!j[key].includes("ostalo") && !j[key].includes("entryID") ){
                    if(index%5 === 0){
                        if(index !== 0){
                            htmlString += "</div></div>"
                        }
                        htmlString += `<div class="container">
                        <div class="row" id="${index}-row">
                        <div class="input-group mb-3" id="${j[key]}-div">
                        <button class="btn btn-outline-secondary" type="button" id="${j[key]}-button">${j[key]}</button>
                        <input id="${j[key]}-input" type="text" class="form-control" placeholder="" aria-label="${j[key]}" aria-describedby="${j[key]}">
                    </div>`
                    $("#advanced").append(htmlString)
                    index += 1
                    }
                    else{
                    htmlString += `<div class="input-group mb-3" id="${j[key]}-div">
                    <button class="btn btn-outline-secondary" type="button" id="${j[key]}-button">${j[key]}</button>
                    <input id="${j[key]}-input" type="text" class="form-control" placeholder="" aria-label="${j[key]}" aria-describedby="${j[key]}">
                </div>`
                    $(`#${index-1}-row`).append(htmlString)
        
                    }
                    addButtonListener(`${j[key]}-button`)
                }  

            }
            htmlString = ""
            key = "ostalo"
            htmlString += `<div class="input-group mb-3" id="${key}-div">
                        <button class="btn btn-outline-secondary" type="button" id="${key}-button">${key}</button>
                        <input id="${key}-input" type="text" class="form-control" placeholder="" aria-label="${key}" aria-describedby="${key}">
                    </div>`
            $(`#${index-1}-row`).append(htmlString)
            addButtonListener("ostalo-button")
            $("#advanced").css("display", "inline")
        
            ADVANCED_SET = true
            ADVANCED_SEARCH = true
        }
        
    }

})

$("#search-button").on('click', function (){
    
    $("#divider").css("display", "inline")
    search();
})