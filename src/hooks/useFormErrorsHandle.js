// import { useState } from "react"
// import Validation from "../class/Validation"

// /**
//  * le hook pour l'affichage des erreurs de formulaire en temps réel
//  * @param {Object} data les donnés à controler
//  * @param {Object} rules les règles pour les données
//  * @param {Object} customMessages les messages personnalisés pour les erreurs
//  * @returns {Object} un objet contenant les fonctions
//  */
// export const useFormErrorsHandle = (data, rules, customMessages) => {
//           const [errors, setErrors] = useState({})

//           const validation = new Validation(data, rules, customMessages)

//           const setError = (key, errors) => {
//                     setErrors(err =>( {...err, [key]: errors}))
//           }

//           const checkFieldData = (e) => {
//                     if(e) {
//                               if( e.preventDefault) {
//                                         e.preventDefault()
//                               }
//                     }
//                     const name = e.target.name
//                     const errors = validation.getError(name)
//                     if(errors?.length !== 0) {
//                               setError(name, errors)
//                     }
//           }

//           const hasError = name => errors[name] ? true : false

//           const getError = name => errors[name][0]

//           const getErrors = () => validation.getErrors()

//           const isValidate = () => {
//                     validation.run()
//                     return validation.isValidate()
//           }

//           const run = () => validation.run()

//           return {
//                     errors, setErrors, setError, getError, hasError, checkFieldData, getErrors, isValidate, run
//           }
// }



import { useState } from "react"
import Validation from "../class/Validation"

/**
 * le hook pour l'affichage des erreurs de formulaire en temps réel
 * @param {Object} data les donnés à controler
 * @param {Object} rules les règles pour les données
 * @param {Object} customMessages les messages personnalisés pour les erreurs
 * @returns {Object} un objet contenant les fonctions
 */
export const useFormErrorsHandle = (data, rules, customMessages, customValidation) => {
          const [errors, setErrors] = useState({})

          const validation = new Validation(data, rules, customMessages, customValidation)

          const setError = (key, errors) => {
                    validation.setError(key, Array.isArray(errors) ? errors[0] : errors)
                    setErrors(err =>( {...err, [key]: Array.isArray(errors) ? errors : []}))
          }

          const checkFieldData = (e) => {
                    if(e) {
                              if( e.preventDefault) {
                                        e.preventDefault()
                              }
                    }
                    const name = e.target.name
                    const errors = validation.getError(name)
                    if(errors?.length !== 0) {
                              setError(name, errors)
                    }
          }

          const hasError = name => errors[name] && errors[name].length > 0 ? true : false

          const getError = name => {
                    const first = errors[name] ? errors[name][0] : null
                    const second = validation.getError(name) ? validation.getError(name)[0] : null
                    if(first) return first
                    return second
          }

          const getErrors = () => validation.getErrors()

          const isValidate = () => {
                    function areSubarraysEmpty(arr) {
                              for (let i = 0; i < arr.length; i++) {
                                if (arr[i].length > 0) {
                                  return false; // If any subarray is not empty, return false
                                }
                              }
                              return true; // If all subarrays are empty, return true
                    }
                    const isValid = areSubarraysEmpty(Object.values(errors))
                    validation.run()
                    return isValid && validation.isValidate()
          }

          const run = () => validation.run()

          return {
                    errors, setErrors, setError, getError, hasError, checkFieldData, getErrors, isValidate, run
          }
}