import ETAT_CREDITS from "../constants/ETAT_CREDITS.js"

export default function etatCreditsColor(idStatut) {
    const defaultColor = {
      backgroundColor: '#ddf1f0',
      textColor: '#000',
      icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-circle" viewBox="0 0 16 16">
                      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                    </svg>`
    }
    const COLORS = {
  
    
      [ETAT_CREDITS.RETARD]: {
        backgroundColor: '#00BFA5',
        textColor: '#f5f5f5',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-exclamation-circle-fill" viewBox="0 0 16 16">
    <path d="M8 0a8 8 0 1 0 8 8A8 8 0 0 0 8 0zm.93 11.412a.5.5 0 1 1-.86.572l-.001-.001A.5.5 0 0 1 8.93 11.412zM8 5a.5.5 0 0 1 .5.5V10a.5.5 0 0 1-1 0V5.5A.5.5 0 0 1 8 5z"/>
    </svg>`
      },
  
      [ETAT_CREDITS.A_TEMPS]: {
        //backgroundColor: '#FF6D00',
        backgroundColor: '#26A69A',
        textColor: '#f5f5f5',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-all" viewBox="0 0 16 16">
    <path d="M8.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L2.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093L8.95 4.992zm-.92 5.14.92.92a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 1 0-1.091-1.028L9.477 9.417l-.485-.486z"/>
  </svg>`
      },
    
  
  
    }
    return COLORS[idStatut] || defaultColor
  }