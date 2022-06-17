import React, {useState, useEffect} from 'react'
import {iniNumState, buildExp, resolveNeg, numKeyCodes, opKeyCodes} from './utils'

const deciRegex = /\./
const negRegex = /^-/

// Initialize array of numbers in the expression
var numbers = [iniNumState]
      

export default function Calculator() {
    // Define states
    const [numObj, setNumObj] = useState(iniNumState)   // Current number
    const [dispText, setDispText] = useState('0')       // Display text
    const [lastInput, setLastInput] = useState(null)    // Last input
    const [fullExp, setFullExp] = useState('')          // Full expression


    // Build current number
    function buildNumber(event) {
        let currentNum;
        let val = event.target.value;

        if (lastInput === 'OPERATION') {         // If last input was an operation, 
            currentNum = {...iniNumState};      // current number is complete, 
            numbers.push(numObj)                // build the next number
        } else if (lastInput === 'EQUALS') {    // Else if last input was equals,
            currentNum = {...iniNumState};      // start new expression
            numbers = [iniNumState] 
        } else {                                // Otherwise, continue building current number
            currentNum = {...numObj}
        }

        // Build number with correct format
        if (val === '.') {
            if (!currentNum.deci) {
                if (currentNum.num === '') {
                    currentNum.num = '0.'
                    currentNum.deci = true;
                    setNumObj(currentNum)
                } else {
                    currentNum.num = currentNum.num + val;
                    currentNum.deci = true;
                    setNumObj(currentNum)
                }
            }
        } else if (val === '-') {
            if (!currentNum.isNeg) {
                if (currentNum.num === '0') {
                    currentNum.num = '';
                    currentNum.isNeg = true;
                    setNumObj(currentNum)
                } else {
                    currentNum.isNeg = true
                    setNumObj(currentNum)
                }
            }
        } else if (currentNum.num === '0') {
            if (val !== '0') {
                currentNum.num = val
                setNumObj(currentNum)
            } else {
                currentNum.num = '0'
                setNumObj(currentNum)
            }
        } else {
            currentNum.num = currentNum.num + val
            setNumObj(currentNum)
        }

        // Display current number and add '-' if number is negative
        currentNum.isNeg ? setDispText('-' + currentNum.num) : setDispText(currentNum.num)

        // Update last input state
        setLastInput('NUMBER')

        // Update full expression
        setFullExp(buildExp([...numbers, currentNum]))
    }

    // Assign operation
    function handleOperator(event) {
        let val = event.target.value;
        let currentNum = {...numObj}

        // Don't accept input if first input is an operation
        if (lastInput === null  && val !== '-') {
            return
        }

        if (val === '-') {                          // If input is '-'
            if (currentNum.nextOp !== null) {       // and there is already and operation assigned, build the next number as a negative number
                buildNumber(event)
            } else if (currentNum.num === '') {     // there is no current number, build a negative number
                buildNumber(event)
            } else {                                // else, assign '-' as the operation of the current number
                setLastInput('OPERATION')
                currentNum.nextOp = val;
                setNumObj(currentNum);
                setDispText(val)
            }
        } else {                                    // Else, set operation of the current number
            setLastInput('OPERATION')
            currentNum.nextOp = val;
            setNumObj(currentNum);
            setDispText(val)
        }

        // Correct false negative number if neccessary
        if (currentNum.num === '' && currentNum.nextOp !== null) {
            numbers[numbers.length - 1].nextOp = val;
            setNumObj(numbers[numbers.length - 1])
            numbers.pop()
        }
    }

    // Clear all
    function clr() {
        setNumObj(iniNumState)      // Reinitialize states
        setDispText('0')
        setLastInput(null)
        setFullExp('')
        numbers = [iniNumState]
    }

    // Calculate results when input is '='
    function calc() {

        // Complete the full expression
        numbers.push(numObj)
        numbers = resolveNeg(numbers)

        // If there is an extra operation input at the end, remove it
        if(numbers[numbers.length - 1].nextOp !== null) {
            numbers[numbers.length - 1].nextOp = null;
        }

        // Start calculation
        let numArr = numbers.slice(1)

        function isMD(arr) {
            return arr.map(x => x.nextOp === '*' || x.nextOp === '/')
        }

        let indMD;
        let res;

        // Prioritize multiplication and divisions
        while(isMD(numArr).indexOf(true) >= 0) {
            indMD = isMD(numArr).indexOf(true)
            
            if (numArr[indMD].nextOp === '*') {
                res = Number(numArr[indMD].num) * Number(numArr[indMD + 1].num)
            } else if (numArr[indMD].nextOp === '/') {
                res = Number(numArr[indMD].num) / Number(numArr[indMD + 1].num)
            }

            let substitute = {
                num: res,
                nextOp:  numArr[indMD + 1].nextOp,
                deci: deciRegex.test(res),
                isNeg: negRegex.test(res)
            }

            numArr = [...numArr.slice(0, indMD), substitute, ...numArr.slice(indMD+2)]
        }

        // Calculate remaining additions and subtractions
        while(numArr.length > 1) {
            if (numArr[0].nextOp === '+') {
                res = Number(numArr[0].num) + Number(numArr[1].num)
            } else if (numArr[0].nextOp === '-') {
                res = Number(numArr[0].num) - Number(numArr[1].num)
            }

            let substitute = {
                num: res,
                nextOp:  numArr[1].nextOp,
                deci: deciRegex.test(res),
                isNeg: negRegex.test(res)
            }

            numArr = [substitute, ...numArr.slice(2)]
        }

        // Update states with results
        setNumObj(...numArr)
        setDispText(numArr[0].num)
        setLastInput('EQUALS')
        numbers = [...numArr]
    }

    // Handles key press
    function handleKeyPress(event) {
        let key = event.key;
        let tempEvent = {target: {value: key}}

        if (numKeyCodes.indexOf(key) >= 0) {
            buildNumber(tempEvent)
        } else if (opKeyCodes.indexOf(key) >= 0) {
            handleOperator(tempEvent)
        } else if (key === '=') {
            calc()
        } else if (key === 'Delete') {
            clr()
        }
    }

    useEffect( () => {
        window.addEventListener('keydown', handleKeyPress)
        return () => window.removeEventListener('keydown', handleKeyPress)
    }, [numObj])

    return (
        <div id="calculator">
            <div id="display-container">
                <p id="full-exp">{fullExp}</p>
                <p id="display">{dispText}</p>
            </div>

            <div id="buttons-container">
                <button id="clear" onClick={clr}>AC</button>
                <button id="divide" className="operation-btn" onClick={handleOperator} value='/'>÷</button>
                <button id="multiply" className="operation-btn" onClick={handleOperator} value='*'>x</button>
                <button id="add" className="operation-btn" onClick={handleOperator} value='+'>+</button>
                <button id="subtract" className="operation-btn" onClick={handleOperator} value='-'>-</button>
                <button id="equals" className="operation-btn" onClick={calc}>=</button>

                <button id="zero" className="num-btn" value={'0'} onClick={buildNumber}>0</button>
                <button id="one" className="num-btn" value={'1'} onClick={buildNumber}>1</button>
                <button id="two" className="num-btn" value={'2'} onClick={buildNumber}>2</button>
                <button id="three" className="num-btn" value={'3'} onClick={buildNumber}>3</button>
                <button id="four" className="num-btn" value={'4'} onClick={buildNumber}>4</button>
                <button id="five" className="num-btn" value={'5'} onClick={buildNumber}>5</button>
                <button id="six" className="num-btn" value={'6'} onClick={buildNumber}>6</button>
                <button id="seven" className="num-btn" value={'7'} onClick={buildNumber}>7</button>
                <button id="eight" className="num-btn" value={'8'} onClick={buildNumber}>8</button>
                <button id="nine" className="num-btn" value={'9'} onClick={buildNumber}>9</button>

                <button id="decimal" className="num-btn" value={'.'} onClick={buildNumber}>.</button>
            </div>
        </div>
    )
}