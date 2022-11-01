export function validEmail(email){
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email))
    {
        return true
    }
    return false
}

export function validPassword(password){
    if((/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.*\s).{8,15}$/).test(password)){
        return true
    }
    return false
}

export function validName(name){
    if((/^[a-zA-Z]+$/).test(name)){
        return true
    }
    return false
}

export function matchPassword(password, confirmPassword){
    if(password === confirmPassword){
        return true
    }
    return false
}

export function singleNumber(value){
    if(value.length === 1 && (/^[0-9]$/).test(value)){
        return true
    }else if(value.length === 0){
        return true
    }
    return false
}



export function checkIfNumber(value){
    
    if((/^[0-9]*$/).test(value)){
        return true
    }
    return false
}

