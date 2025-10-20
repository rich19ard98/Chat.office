
import ID_STATUTS_CREDIT from "../constants/ID_STATUTS_CREDIT.js"



export default function statutCreditsColor(idStatut) {
  const defaultColor = {
    backgroundColor: '#ddf1f0',
    textColor: '#000',
    icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-circle" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  </svg>`
  }
  const COLORS = {

    [ID_STATUTS_CREDIT.ANNULE]: {

      backgroundColor: '#FF6D00',
      textColor: '#f5f5f5',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
    </svg>`
    },
    [ID_STATUTS_CREDIT.APPROUVE]: {
      backgroundColor: '#143d8f',
      textColor: '#f5f5f5',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="30" fill="currentColor" class="bi bi-check-circle" viewBox="0 0 16 16">
  <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
  <path d="m10.97 4.97-.02.022-3.473 4.425-2.093-2.094a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-1.071-1.05"/>
</svg>`
    },

    [ID_STATUTS_CREDIT.EN_ATTENTE_D_APPROBATION]: {
      backgroundColor: '#FFE082',
      textColor: '#4E342E',       
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="30" height="16" fill="#EF6C00" class="bi bi-exclamation-circle" viewBox="0 0 16 16">
    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
    <path d="M7.001 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zm.93-6.481-.082 4.002a.5.5 0 0 0 .998.04l.082-4.002a.5.5 0 0 0-.998-.04z"/>
  </svg>`
    }
    ,
    [ID_STATUTS_CREDIT.EN_COURS]: {
      backgroundColor: '#42A5F5',
      textColor: '#f5f5f5',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-repeat" viewBox="0 0 16 16">
      <path d="M11.534 7h3.932a.25.25 0 0 1 .192.41l-1.966 2.36a.25.25 0 0 1-.384 0l-1.966-2.36a.25.25 0 0 1 .192-.41m-11 2h3.932a.25.25 0 0 0 .192-.41L2.692 6.23a.25.25 0 0 0-.384 0L.342 8.59A.25.25 0 0 0 .534 9"/>
      <path fill-rule="evenodd" d="M8 3c-1.552 0-2.94.707-3.857 1.818a.5.5 0 1 1-.771-.636A6.002 6.002 0 0 1 13.917 7H12.9A5 5 0 0 0 8 3M3.1 9a5.002 5.002 0 0 0 8.757 2.182.5.5 0 1 1 .771.636A6.002 6.002 0 0 1 2.083 9z"/>
    </svg>`
    },
    [ID_STATUTS_CREDIT.EN_RETARD]: {
      backgroundColor: '#00BFA5',
      textColor: '#f5f5f5',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-circle-fill" viewBox="0 0 16 16">
  <path d="M8 0a8 8 0 1 0 8 8A8 8 0 0 0 8 0zm.93 11.412a.5.5 0 1 1-.86.572l-.001-.001A.5.5 0 0 1 8.93 11.412zM8 5a.5.5 0 0 1 .5.5V10a.5.5 0 0 1-1 0V5.5A.5.5 0 0 1 8 5z"/>
  </svg>`
    },

    [ID_STATUTS_CREDIT.REMBOURSE]: {
      //backgroundColor: '#FF6D00',
      backgroundColor: '#26A69A',
      textColor: '#f5f5f5',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-all" viewBox="0 0 16 16">
  <path d="M8.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L2.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093L8.95 4.992zm-.92 5.14.92.92a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 1 0-1.091-1.028L9.477 9.417l-.485-.486z"/>
</svg>`
    },

    [ID_STATUTS_CREDIT.EN_ATTENTE_DE_VALIDATION]: {
      backgroundColor: '#388E3C',
      textColor: '#f5f5f5',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="30" fill="currentColor" class="bi bi-clock-history" viewBox="0 0 16 16">
        <path d="M8.515 3.354a.5.5 0 0 0-1 0V8h4a.5.5 0 0 0 0-1H8.515V3.354z"/>
        <path d="M8 16A8 8 0 1 1 16 8a8 8 0 0 1-8 8zM1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8z"/>
      </svg>`
    },
    [ID_STATUTS_CREDIT.REMBOURSEMENT_PRECOCE]: {
      backgroundColor: '#FF6D00',

      textColor: '#f5f5f5',
      icon: ` <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-return-left" viewBox="0 0 16 16">
  <path fill-rule="evenodd" d="M7.5 1a.5.5 0 0 1 .5.5v3.793l2.146-2.147a.5.5 0 0 1 .708.708l-3.5 3.5a.5.5 0 0 1-.5 0l-3.5-3.5a.5.5 0 0 1 .708-.708L7 5.293V1.5a.5.5 0 0 1 .5-.5zM1 8a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H1.5A.5.5 0 0 1 1 8z"/>
</svg>`
    },


  }
  return COLORS[idStatut] || defaultColor
}