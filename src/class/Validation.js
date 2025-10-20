// export default class Validation {
//   // constructor(data, validation, customMessages) {
//   //   this.data = data
//   //   this.validation = validation
//   //   this.customMessages = customMessages
//   //   this.errors = {}
//   // }
//   constructor(data, validation, customMessages, customValidations) {
//     this.data = data
//     this.validation = validation
//     this.customMessages = customMessages
//     this.errors = {}
//     this.customValidations = customValidations
// }

//   isValidate() {
//     return Object.keys(this.getErrors()).length === 0 && this.getErrors().constructor === Object
//   }

//   setError(key, message) {
//     const errors = this.errors[key] ? [...this.errors[key], message] : [message]
//     this.errors = { ...this.errors, [key]: errors }
//   }

//   getError(key) {
//     this.run()
//     return this.errors[key]
//   }

//   required(key, intitialValue) {
//     if (!this.validation[key] || !this.validation[key].required) return false
//     const value = typeof (intitialValue) == 'string' ? intitialValue ? intitialValue.trim() : '' : intitialValue
//     let isInvalid = false
//     if (typeof (value) == 'string' || Array.isArray(value)) {
//       if (!value || value === '' || value.length === 0) {
//         isInvalid = true
//       }
//     } else if (typeof (value) == 'object' && !Array.isArray(value)) {
//       if (!value) {
//         isInvalid = true
//       }
//     } else {
//       if (!intitialValue) {
//         isInvalid = true
//       }
//     }
//     if (isInvalid) {
//       this.setError(key, this.customMessages?.[key]?.required || `This field is required`)
//     }
//   }

//   length(key, intitialValue, params) {
//     const value = typeof (intitialValue) == 'string' ? intitialValue ? intitialValue.trim() : '' : "yeah"
//     const trimedValue = value.trim()
//     if (!trimedValue) return
//     const [min, max] = params
//     if (min && !max && trimedValue.length < min) {
//       this.setError(key, this.customMessages?.[key]?.length || `Enter et least ${min} characters`)
//     } else if (!min && max && trimedValue.length > max) {
//       this.setError(key, this.customMessages?.[key]?.length || `You can not exceed ${max} characters`)
//     } else if ((min && max) && (trimedValue.length < min || trimedValue.length > max)) {
//       this.setError(key, this.customMessages?.[key]?.length || `The value of this field must be between ${min} and ${max}`)
//     }
//   }
//   match(key, value, params) {
//     if (!value) return
//     if (this.data[params] !== value) {
//       this.setError(key, this.customMessages?.[key]?.match || `Value does not match the ${params} value`)
//     }
//   }
//   username(key, value) {
//     if (!value) return
//     const validUsername = /^[a-zA-Z0-9._]+$/.test(value)
//     if (!validUsername || value.length < 2) {
//       this.setError(key, this.customMessages?.[key]?.username || 'Incorrect username (letters, numbers, point or underscore)')
//     }
//   }
//   email(key, value) {
//     if (!value) return
//     const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
//     if (!validEmail) {
//       this.setError(key, this.customMessages?.[key]?.email || 'Incorrect email')
//     }
//   }
//   number(key, value) {
//     if (!value) return
//     let isnum = /^\d+$/.test(value);
//     if (!isnum) {
//       this.setError(key, this.customMessages?.[key]?.number || `This field must be a valid number`)
//     }
//   }

  // decimal(key, value) {
  //   if (!value) return;
  //   let pattern = /^-?\d*[\.,]?\d+$/.test(value);
  //   if (!pattern) {
  //     this.setError(key, this.customMessages?.[key]?.decimal || 'This field must be a valid decimal');
  //   }
  // }
 
//   string(key, value) {
//     if (!value) return
//     const pattern = /^[a-zA-Z0-9!@#%^&*()_+, ]+$/
//     let isString = pattern.test(value);
//     if (!isString) {
//       this.setError(key, this.customMessages?.[key]?.string || `This field must be a valid string`)
//     }
//   }
//   alpha(key, value) {
//     if (!value) return
//     const pattern = /^[\w\s!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~\u00C0-\u017F]+$/u
//     let isString = pattern.test(value);
//     if (!isString) {
//       this.setError(key, this.customMessages?.[key]?.alpha || `This field must contains alphanumeric characters only`)
//     }
//   }

//   image(key, value, params) {
//     if (!value) return
//     const IMAGES_MIMES = ['image/jpeg', 'image/gif', 'image/png']
//     if (value) {
//       if (!IMAGES_MIMES.includes(value.type)) {
//         this.setError(key, this.customMessages?.[key]?.image || 'Please choose a valid image')
//       } else if (params < value.size) {
//         const megaBite = (params - 1000000) / 1000000
//         this.setError(key, this.customMessages?.[key]?.size || `Your image is too large (max: ${megaBite} MB)`)
//       }
//     }
//   }

//   // run() {
//   //   for (let key in this.validation) {
//   //     const value = this.getValue(key)
//   //     const [properties, params] = this.getProperties(this.validation[key])
//   //     properties.forEach(property => {
//   //       this[property](key, value, params?.[property])
//   //     });
//   //   }
//   // }
//   run() {
//     for(let key in this.validation) {
//               if(this.validation[key]) {
//                         const value = this.getValue(key)
//                         const [properties, params] = this.getProperties(this.validation[key])
//                         properties.forEach(property => {
//                                   this[property](key, value, params?.[property])
//                         });         
//               }
//     }
//     // running custom validation
//     if(this.customValidations) {
//               for(let key in this.customValidations) {
//                         if(this.customValidations[key].length > 0) {
//                                   this.customValidations[key].forEach(customValidation => {
//                                             if(!customValidation.isValid(this.data)) {
//                                                       this.setError(key, this.customMessages[key][customValidation.validationName] || `Error message not specified`)
//                                             }
//                                   })
//                         }
//               }
//     }
// }

//   getErrors() {
//     this.run()
//     return this.errors
//   }

//   getProperties(value) {
//     switch (typeof (value)) {
//       case 'string':
//         return [value.split(','), null]

//       case 'object':
//         const properties = []
//         for (let key in value) {
//           properties.push(key)
//         }
//         return [properties, value]

//       default:
//         return [value, null]
//     }
//   }

//   getValue(key) {
//     return this.data[key]
//   }
// }























import moment from "moment"

export default class Validation {
          constructor(data, validation, customMessages, customValidations) {
                    this.data = data
                    this.validation = validation
                    this.customMessages = customMessages
                    this.errors = {}
                    this.customValidations = customValidations
          }

          isValidate() {
                    return Object.keys(this.getErrors()).length === 0 && this.getErrors().constructor === Object
          }

          setError(key, message) {
                    const errors = this.errors[key] ? [...this.errors[key], message] : [message]
                   this.errors = {...this.errors,  [key]: errors}
          }

          getError(key) {
                    this.run()
                    return this.errors[key]
          }

          required(key, intitialValue) {
                    if(!this.validation[key] || !this.validation[key].required) return false
                    const value =  typeof(intitialValue) == 'string' ? intitialValue ? intitialValue.trim() : '' : intitialValue
                    let isInvalid = false
                    if(typeof(value) == 'string' || Array.isArray(value)) {
                              if(!value || value === '' || value.length === 0) {
                                        isInvalid = true
                              }
                    } else if(typeof(value) == 'object' && !Array.isArray(value)) {
                              if(!value) {
                                        isInvalid = true
                              }
                    } else if(!value) {
                              isInvalid = true
                    }
                   if(isInvalid) {
                             this.setError(key, this.customMessages?.[key]?.required || `Ce champ est obligatoire`)
                   }
          }

          length(key, intitialValue, params) {
                    const value =  typeof(intitialValue) == 'string' ? intitialValue ? intitialValue.trim() : '' : ""
                    const trimedValue = value.trim()
                    if(!trimedValue) return
                    const [min, max] = params
                    if(min && !max && trimedValue.length < min) {
                              this.setError(key, this.customMessages?.[key]?.length || `Saisissez au moins ${min} caractères`)
                    } else if (!min && max && trimedValue.length > max) {
                              this.setError(key, this.customMessages?.[key]?.length || `Vous ne pouvez pas dépasser ${max} caractères`)
                    }else if((min && max ) && (trimedValue.length < min || trimedValue.length > max)) {
                              this.setError(key, this.customMessages?.[key]?.length || `La valeur de ce champ doit être comprise entre ${min} et ${max}`)
                    }
          }
          match(key, value, params) {
                    if(!value) return
                    if(this.data[params] !== value) {
                              this.setError(key, this.customMessages?.[key]?.match || `La valeur ne correspond pas à la valeur ${params}`)
                    }
          }
          username(key, value) {
                    if(!value) return
                    const validUsername = /^[a-zA-Z0-9._]+$/.test(value)
                    if(!validUsername || value.length < 2) {
                              this.setError(key, this.customMessages?.[key]?.username || "Nom d'utilisateur incorrect (lettres, chiffres, point ou trait de soulignement)")
                    }
          }
          email(key, value) {
                    if(!value) return
                    const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                    if(!validEmail) {
                              this.setError(key, this.customMessages?.[key]?.email || 'Adresse Email incorrecte')
                    }
          }
          number(key, value) {
                    if(!value) return
                    let isnum = /^\d+$/.test(value);
                    if(!isnum) {
                              this.setError(key, this.customMessages?.[key]?.number || `Ce champ doit être un numéro valide`)
                    }
          }
          integer(key, value) {
                    if(!value) return
                    let isnum = isNaN(value)
                    if(isnum) {
                              this.setError(key, this.customMessages?.[key]?.integer || `This field must be a valid integer`)
                    }
          }
          date(key, value, params) {
                    if(!value) return
                    const format = params
                    let isDate = moment(value, format).isValid()
                    if(!isDate) {
                              this.setError(key, this.customMessages?.[key]?.date || `This field must be a valid date(${format})`)
                    }
          }
          decimal(key, value) {
            if (!value) return;
            let pattern = /^-?\d*[\.,]?\d+$/.test(value);
            if (!pattern) {
              this.setError(key, this.customMessages?.[key]?.decimal || 'This field must be a valid decimal');
            }
          }
          string(key, value) {
                    if(!value) return
                    const pattern = /^[a-zA-Z0-9!@#%^&*()_+, ]+$/
                    let isString = pattern.test(value);
                    if(!isString) {
                              this.setError(key, this.customMessages?.[key]?.string || `Ce champ doit être une chaîne valide`)
                    }
          }
          alpha(key, value) {
                    if(!value) return
                    const pattern = /^[\w\s!"#$%&'()*+,-./:;<=>?@[\\\]^_`{|}~\u00C0-\u017F]+$/u
                    let isString = pattern.test(value);
                    if(!isString) {
                              this.setError(key, this.customMessages?.[key]?.alpha || `Ce champ doit contenir uniquement des caractères alphanumériques`)
                    }
          }

          image(key, value, params) {
                    if(!value) return
                    const IMAGES_MIMES = ['image/jpeg', 'image/gif', 'image/png']
                    if(value) {
                              if(!IMAGES_MIMES.includes(value.type)) {
                                        this.setError(key, this.customMessages?.[key]?.image || 'Veuillez choisir une image valide')
                              } else if(params < value.size) {
                                        const megaBite = (params - 1000000) / 1000000
                                        this.setError(key, this.customMessages?.[key]?.size || `Votre image est trop grande (max: ${megaBite} MB)`)
                              }
                    }
          }

          fileTypes(key, value, params) {
            if (!value) return;
                    const VALID_MIMES = params
                    if (!VALID_MIMES.includes(value?.type?.toLowerCase())) {
                              this.setError(
                                        key,
                                        this.customMessages?.[key]?.fileTypes || `Invalid file type(${params.join(', ')})`
                              )
                    }
          }

          fileSize(key, value, params) {
                    if (!value || !value?.size) return;
                    if (params < value.size) {
                              const megaBite = (params - 1000000) / 1000000;
                              this.setError(
                                        key,
                                        this.customMessages?.[key]?.fileSize || `File too large (max: ${megaBite} MB)`
                              );
                    }
          }

          run() {
                    for(let key in this.validation) {
                              if(this.validation[key]) {
                                        const value = this.getValue(key)
                                        const [properties, params] = this.getProperties(this.validation[key])
                                        properties.forEach(property => {
                                                  this[property](key, value, params?.[property])
                                        });         
                              }
                    }
                    // running custom validation
                    if(this.customValidations) {
                              for(let key in this.customValidations) {
                                        if(this.customValidations[key].length > 0) {
                                                  this.customValidations[key].forEach(customValidation => {
                                                            if(!customValidation.isValid(this.data)) {
                                                                      this.setError(key, this.customMessages[key][customValidation.validationName] || `Error message not specified`)
                                                            }
                                                  })
                                        }
                              }
                    }
          }

          getErrors() {
                    this.run()
                    return this.errors
          }

          getProperties(value) {
                    switch (typeof(value)) {
                              case 'string':
                                        return [value.split(','), null]

                              case 'object':
                                        const properties = []
                                        for(let key in value) {
                                                  properties.push(key)
                                        }
                                        return [properties, value]
                    
                              default:
                                        return [value, null]
                    }
          }

          getValue(key)
          {
                    return this.data[key]
          }
}