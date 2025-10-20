/**
 * Récupérer toutes les Comptes comptables
 * @date  15/04/2025
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author rosine <gahimbarerosine9@gmail.com>
 */
import React from 'react'

export default function Signatureelectroniqueobr({ detail }) {

  return (
    <div className='ml-5 mt-5'>
      <span className="px-4 py-4 mr-9">
        {detail.ELECTRONIQUE_SIGNATURE}
      </span>
    </div>
  )
}