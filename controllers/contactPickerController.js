const countryStateCity = require("country-state-city")
module.exports={
    dialPicker:(req,res)=>{
        const countries= countryStateCity.Country.getAllCountries();
        // var targetCountry=[]
        const pattern= new RegExp(req.body.pattern,'gi')
        // const pattern = /ind/gi;
        const list = [];
        
        for (let index = 0; index < countries.length; index++) {
            const element = countries[index];
            if (element.phonecode.search(pattern) !== -1) {
                list.push([{country_name:element.name,country_code:element.isoCode,country_dia_code:element.phonecode}]);
            }
        }
        if(list.length<1){
            return res.json({responseCode:400,responseMessage:"hello from countryPicker",Countries:"No country related to this pattern"})
        }
        return res.json({responseCode:200,responseMessage:"hello from countryPicker",Countries:list})

    },
    countryPicker:(req,res)=>{
        const countries= countryStateCity.Country.getAllCountries();
        // var targetCountry=[]
        const pattern= new RegExp(req.body.pattern,'gi')
        // const pattern = /ind/gi;
        const list = [];
        
        for (let index = 0; index < countries.length; index++) {
            const element = countries[index];
            if (element.name.search(pattern) !== -1) {
                list.push([element.name,element.isoCode]);
            }
        }
        if(list.length<1){
            return res.json({responseCode:400,responseMessage:"hello from countryPicker",Countries:"No country related to this pattern"})
        }
        return res.json({responseCode:200,responseMessage:"hello from countryPicker",Countries:list})
    },
    statePicker:(req,res)=>{
        const states= countryStateCity.State.getStatesOfCountry((req.query.codeOfCountry).toUpperCase());
        // var targetCountry=[]
        const pattern= new RegExp(req.body.pattern,'gi')
        // const pattern = /ind/gi;
        const list = [];
        
        for (let index = 0; index < states.length; index++) {
            const element = states[index];
            if (element.name.search(pattern) !== -1) {
                list.push([element.name,element.isoCode]);
            }
        }
        if(list.length<1){
            return res.json({responseCode:400,responseMessage:"hello from statePicker",State:"No state related to this pattern"})
        }
        return res.json({responseCode:200,responseMessage:"hello from statePicker",State:list})
    },
    cityPicker:(req,res)=>{
        const states= countryStateCity.City.getCitiesOfState((req.query.codeOfCountry).toUpperCase(), (req.query.stateCode).toUpperCase());
        // var targetCountry=[]
        const pattern= new RegExp(req.body.pattern,'gi')
        // const pattern = /ind/gi;
        const list = [];
        
        for (let index = 0; index < states.length; index++) {
            const element = states[index];
            console.log(element)
            if (element.name.search(pattern) !== -1) {
                list.push(element.name);
            }
        }
        if(list.length<1){
            return res.json({responseCode:400,responseMessage:"hello from cityPicker",City:"No city related to this pattern"})
        }
        return res.json({responseCode:200,responseMessage:"hello from cityPicker",City:list})
        
    }
}