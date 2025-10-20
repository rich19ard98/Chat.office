

import { useForm } from "../../hooks/useForm";
import { Button } from "primereact/button";
import { useState } from "react";
import { useFormErrorsHandle } from "../../hooks/useFormErrorsHandle";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setToastAction } from "../../store/actions/appActions";
import fetchApi from "../../helpers/fetchApi";
import wait from "../../helpers/wait";
import { useEffect } from "react";
import { Dropdown } from "primereact/dropdown";
import { useCallback } from "react";
import { InputText } from "primereact/inputtext";

import { MultiSelect } from 'primereact/multiselect';
import PROFILS from "../../constants/PROFILS";

const initialForm = {
  ADRESSE_CLIENT: "",
  EMAIL: '',
  TEL: "",
  NOM_CLIENT: "",
  NIF: '',
  IS_ASSUJETTI: ''

}


export default function Editerclient({ setClientediter, detail, findonecommandClient }) {
  console.log('detail', detail);

  const dispacth = useDispatch();
  const [data, handleChange, setData, setValue] = useForm(initialForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const [medicament, setMedicament] = useState([]);
  const [codes, setCodes] = useState(null);
  const [loadingRequisition, setLoadingRequisition] = useState(true);
  const [selectedCorporate, setSelectedCorporate] = useState([]);
  const [corporatedata, setCorporatedata] = useState([])
  const { hasError, getError, setErrors, getErrors, checkFieldData, isValidate, setError } = useFormErrorsHandle(data,
    {

      NOM_CLIENT: {
        required: true,
        length: [1, 100],
        alpha: true,
      },

      TEL: {
        length: [1, 20],
        alpha: true,
      },
      NIF: {
        alpha: true,
        length: [1, 30],
      },

      EMAIL: {
        length: [1, 100],
        alpha: true,
      },
      ADRESSE_CLIENT: {
        length: [1, 100],
        alpha: true,
      },

    }, {

    NOM_CLIENT: {
      required: "Ce champ est obligatoire",
      length: "Le nom    ne doit pas depasser max(100 caracteres)",
      alpha: "Le nom   est invalide",
    },
    TEL: {
      length: "Le numero du telephone   ne doit pas depasser max(20 caracteres)",
      alpha: "Le numero du telephone  est invalide",
    },

    EMAIL: {
      length: "Email ne doit pas depasser max(100 caracteres)",
      alpha: "email  est invalide",
    },
    NIF: {
      length: "Le NIF ne doit pas depasser max(30 caracteres)",
      alpha: "L'email est invalide",
    },
    ADRESSE_CLIENT: {
      length: "L'adresse ne doit pas depasser max(50 caracteres)",
      alpha: "Adresse est invalide",
    },

  }
  );

  const [assujet, setAssujet] = useState([
    {
      code: 1,
      name: 'Oui'
    },
    {
      code: 0,
      name: 'Non'
    },

  ]);


  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (isValidate()) {
        setIsSubmitting(true);
        const form = new FormData();
        form.append("NOM_CLIENT", data.NOM_CLIENT);
        form.append("TEL", data.TEL);
        form.append("EMAIL", data.EMAIL);
        form.append("ADRESSE_CLIENT", data.ADRESSE_CLIENT);
        form.append("NIF", data.NIF);
        form.append("IS_ASSUJETTI", data.IS_ASSUJETTI.code);
        const res = await fetchApi(`/gerer/client/update/${detail.ID_CLIENT}`, {
          method: "put",
          body: form,
        });

        dispacth(
          setToastAction({
            severity: "success",
            summary: "Client modifie",
            detail: "Le client  a bien été modifie avec succès",
            life: 3000,
          })
        );
        setClientediter(null)
        findonecommandClient()

      } else {
        console.log(getErrors());
        setErrors(getErrors());
        dispacth(
          setToastAction({
            severity: "error",
            summary: "La validation des données a échouée",
            detail: "Veuillez corriger les erreurs mentionnées pour continuer",
            life: 3000,
          })
        );
        await wait(500);
        const header = document.querySelector("header");
        const nav = document.querySelector("nav");
        const firstErrorElement = document.querySelector(".p-invalid");
        if (firstErrorElement) {
          var headerHeight = 0;
          if (header) headerHeight += header.offsetHeight;
          if (nav) headerHeight += nav.offsetHeight;
          const scrollPosition =
            firstErrorElement.getBoundingClientRect().top +
            window.scrollY -
            headerHeight;
          window.scrollTo({
            top: scrollPosition,
            behavior: "smooth",
          });
        }
      }
    } catch (error) {
      console.log(error);
      if (error.httpStatus == "UNPROCESSABLE_ENTITY") {
        setErrors(error.result);
        dispacth(
          setToastAction({
            severity: "error",
            summary: "Erreur du système",
            detail: "Erreur du système, réessayez plus tard",
            life: 3000,
          })
        );
        await wait(500);
        const header = document.querySelector("header");
        const nav = document.querySelector("nav");
        const firstErrorElement = document.querySelector(".p-invalid");
        if (firstErrorElement) {
          var headerHeight = 0;
          if (header) headerHeight += header.offsetHeight;
          if (nav) headerHeight += nav.offsetHeight;
          const scrollPosition =
            firstErrorElement.getBoundingClientRect().top +
            window.scrollY -
            headerHeight;
          window.scrollTo({
            top: scrollPosition,
            behavior: "smooth",
          });
        }
      } else {
        dispacth(
          setToastAction({
            severity: "error",
            summary: "Erreur du système",
            detail: "Erreur du système, réessayez plus tard",
            life: 3000,
          })
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };


  useEffect(() => {
    (async () => {
      try {
        const uti = detail;
        setData({
          // QUANTITE_ENTREE: uti.QUANTITE_ENTREE
          TITRE_REUNION: uti.TITRE_REUNION,
          // EMAIL: uti.EMAIL,
          // TEL: uti.TEL,
          // NOM_CLIENT: uti.NOM_CLIENT,
          // NIF: uti.NIF,
          // IS_ASSUJETTI: uti.IS_ASSUJETTI == 1 ? assujet[0] : assujet[1],

          //   setSelectedCorporate(uti.drivercorp.map(corp => {
          //     return (corp.cor_corporate ? corp.cor_corporate.ID_CORP_CORPORATE : null)
          // }))
        });
        setSelectedCorporate(uti.membrerecusnotif.map(corp => {
          return (corp.membrerecusnotif ? corp.membrerecusnotif.ID_UTILISATEURS : null)
        }))
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingRequisition(false);
      }
    })();
  }, []);

  //   if (loadingFact) {
  //     return (
  //       <div className="d-flex justify-content-center align-items-center h-100 w-100">
  //         <div className="spinner-border" role="status" />
  //       </div>
  //     );
  //   }



  // // liste deroulante des membres
  // const fetchMembre = useCallback(async () => {
  //   try {
  //     const res = await fetchApi(`/administration/utilisateurs/fetch?rows=1000000&membre=${PROFILS.MEMBRE}`)
  //     setMembre(
  //       res.result.data.map((access) => {
  //         return {
  //           name: `${access.PRENOM} ${access.NOM}`,
  //           code: access.ID_UTILISATEUR,
  //         };
  //       })
  //     );
  //     setCodes(res)
  //   } catch (error) {
  //     console.log(error);
  //   }
  // }, []);

  // useEffect(() => {
  //   fetchMembre()
  // }, [])



  const fetchCorporate = useCallback(async () => {
    try {
      const res = await fetchApi(`/administration/utilisateurs/fetch?rows=1000000&membre=${PROFILS.MEMBRE}`)
      setCorporatedata(res.result.data.map(access => {
        return {
          name: `${access.PRENOM} ${access.NOM}`,
          code: access.ID_UTILISATEUR,
        }
      }))

    } catch (error) {
      console.log(error)
    }
  }, [])

  useEffect(() => {
    fetchCorporate()
  }, [])

  const handleChangeValue = (e) => {
    setSelectedCorporate(e.value)
  }

  return (

    <form className="form " onSubmit={handleSubmit}>
      <div className="form-group row mt-5">
        <div className="col-md-2">
          <label htmlFor="NOM_CLIENT" className="label mb-1">Reunion</label>
        </div>
        <div className="col-sm">
          <InputText
            type="text"
            placeholder="Ecrire le nom du client"
            id="TITRE_REUNION"
            name="TITRE_REUNION"
            value={data.TITRE_REUNION}
            onChange={handleChange}
            onBlur={checkFieldData}
            className={`w-100 ${hasError("TITRE_REUNION") ? "p-invalid" : ""}`}
          />
          <div
            className="invalid-feedback"
            style={{ minHeight: 21, display: "block" }}
          >
            {hasError("TITRE_REUNION") ? getError("TITRE_REUNION") : ""}
          </div>
        </div>


        <div className="col-md-2">
          <label htmlFor="ADRESSE_CLIENT" className="label mb-1">
            Membres a notifier
          </label>
        </div>
        <div className="col-sm">
          <MultiSelect name="Corporates"
            value={selectedCorporate}
            onChange={handleChangeValue} options={corporatedata}
            optionLabel="name" optionValue="code"
            filter
            placeholder=" Membres a notifier" maxSelectedLabels={1}
            onHide={() => {
              checkFieldData({ target: { name: "selectedCorporate" } })
            }}
            selectedItemsLabel={`${selectedCorporate?.length > 1 ? `${selectedCorporate?.length} sélectionnés` : `${selectedCorporate?.length} sélectionnés`}`}
            className={`w-100 ${hasError('selectedCorporate') ? 'p-invalid' : ''}`}
            showClear
          />
          <div
            className="invalid-feedback"
            style={{ minHeight: 21, display: "block" }}
          >
            {hasError("IS_ASSUJETTI") ? getError("IS_ASSUJETTI") : ""}
          </div>
        </div>

      </div>


      <div className="w-100 d-flex justify-content-end align-items-end">
        <Button
          label='Modifier'
          type="submit"
          className="mt-3 ml-3"
          size="small"
          onClick={handleSubmit}
        // disabled={!isValidate() || isSubmitting}
        />
      </div>
    </form>


  )
}