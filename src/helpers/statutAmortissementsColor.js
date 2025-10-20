

import STATUTS_AMORTISSEMENTS from "../constants/STATUTS_AMORTISSEMENTS.js"



export default function statutAmortissementsColor(idStatut) {
  const defaultColor = {
    backgroundColor: '#ddf1f0',
    textColor: '#000',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-circle" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  </svg>`
  }
  
  const COLORS = {
    [STATUTS_AMORTISSEMENTS.EN_ATTENTE]: {
      backgroundColor: '##FFB7' ,
      textColor: '#ffff',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-repeat" viewBox="0 0 16 16">
      <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9"/>
      <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z"/>
    </svg>`
    },
    [STATUTS_AMORTISSEMENTS.PAYE]: {
      backgroundColor: '#2196F3',
     // backgroundColor: '#26A69A',
      textColor: '#f5f5f5',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-all" viewBox="0 0 16 16">
  <path d="M8.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L2.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093L8.95 4.992zm-.92 5.14.92.92a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 1 0-1.091-1.028L9.477 9.417l-.485-.486z"/>
</svg>`
    },
    
   
    [STATUTS_AMORTISSEMENTS.EN_RETARD]: {
      backgroundColor: '#00BFA5',
      textColor: '#f5f5f5',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-circle-fill" viewBox="0 0 16 16">
  <path d="M8 0a8 8 0 1 0 8 8A8 8 0 0 0 8 0zm.93 11.412a.5.5 0 1 1-.86.572l-.001-.001A.5.5 0 0 1 8.93 11.412zM8 5a.5.5 0 0 1 .5.5V10a.5.5 0 0 1-1 0V5.5A.5.5 0 0 1 8 5z"/>
  </svg>`
    },

    


  }
  return COLORS[idStatut] || defaultColor
}