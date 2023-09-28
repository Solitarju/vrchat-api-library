class Util {

    static GenerateParameters = (params = {}) => {
        var paramString = "";
        Object.keys(params).forEach((key) => {
            var value = params[key];
            if(!value && typeof(value) != 'boolean') return;
            if(value === QuerySort) return;
            if(value === QueryOrder) return;
            if(value === QueryReleaseStatus) return;
    
            if(key === "n" && value === 60) return;
            if(key === "user" && value === true) value = "me";
            if(key === "sort" && value instanceof QuerySort) value = value.type;
            if(key === "order" && value instanceof QueryOrder) value = value.type;
            if(key === "releaseStatus" && value instanceof QueryReleaseStatus) value = value.type;
    
            if(paramString) {
                paramString += `&${key}=${value}`;
                return;
            }
    
            paramString += `${key}=${value}`;
        });
        return paramString;
    }
}

module.exports = Util;