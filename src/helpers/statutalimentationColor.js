import STATUT_ALIMENTATION from "../constants/STATUT_ALIMENTATION"



export default function statutalimentationColor(idStatut) {
    const defaultColor = {
        backgroundColor: '#ddf1f0',
        textColor: '#000',
        icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-circle" viewBox="0 0 16 16">
                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                  </svg>`
    }

    const COLORS = {
        [STATUT_ALIMENTATION.VALIDE]: {
            backgroundColor: '#095a9cff',
            // backgroundColor: '#26A69A',
            textColor: '#f5f5f5',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check-all" viewBox="0 0 16 16">
  <path d="M8.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L2.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093L8.95 4.992zm-.92 5.14.92.92a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 1 0-1.091-1.028L9.477 9.417l-.485-.486z"/>
</svg>`
        },
        [STATUT_ALIMENTATION.EN_ATTENTE]: {
            backgroundColor: '#1100ffff',
            textColor: '#f5f5f5ff',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="30" fill="currentColor" class="bi bi-clock-history" viewBox="0 0 16 16">
        <path d="M8.515 3.354a.5.5 0 0 0-1 0V8h4a.5.5 0 0 0 0-1H8.515V3.354z"/>
        <path d="M8 16A8 8 0 1 1 16 8a8 8 0 0 1-8 8zM1 8a7 7 0 1 0 14 0A7 7 0 0 0 1 8z"/>
      </svg>`
        },
        [STATUT_ALIMENTATION.REJETE]: {
            backgroundColor: '#ff0000ff',
            textColor: '#f5f5f5',
            icon: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
      <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"/>
    </svg>`
        },


    }
    return COLORS[idStatut] || defaultColor
}