export const iniNumState = {
    num: '',
    nextOp: null,
    deci: false,
    isNeg: false
};


export const buildExp = (numArr) => {
    let simplified = numArr.slice(1).map(x => {
        if (x.isNeg) {
            return '-' + x.num + (x.nextOp ? x.nextOp : '')
        } else { 
            return x.num + (x.nextOp ? x.nextOp : '')
        }
    })
    return simplified.join('')
}

export const resolveNeg = (numArr) => {
    return numArr.map(x => {
        if (x.isNeg) {
            return {
                ...x,
                num: '-' + x.num
            }
        } else {
            return x
        }
    })
}

export const numKeyCodes = ['0', '1', '2', '3', '4', 
                    '5', '6', '7', '8', '9', '.'];

export const opKeyCodes = ['*', '/', '+', '-']