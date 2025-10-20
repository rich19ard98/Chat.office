import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBreadCrumbItemsAction, setToastAction} from "../../store/actions/appActions";
import { Button } from "primereact/button";
import { Calendar } from "primereact/calendar";
import { useForm } from "../../hooks/useForm";
import { useFormErrorsHandle } from "../../hooks/useFormErrorsHandle";
import fetchApi from "../../helpers/fetchApi";
import { Dropdown } from "primereact/dropdown";
import { InputText } from "primereact/inputtext";
import { FileUpload } from "primereact/fileupload";
import wait from "../../helpers/wait";
import Loading from "../../components/app/Loading";
import { useNavigate, useParams } from "react-router-dom";
import { Image } from "primereact/image";
import { setUserAction } from "../../store/actions/userActions";
import { userSelector } from "../../store/selectors/userSelector";
import { decodeId } from "../../utils/IdEncryption";
import PROFILS from "../../constants/PROFILS";
import { ConfirmDialog } from "primereact/confirmdialog";
import IDS_ROLES from "../../constants/IDS_ROLES";
import NotFound from "../home/NotFound";
const initialForm = {
  NOM: "",
  PRENOM: "",
  TELEPHONE: "",
  EMAIL: "",
  USERNAME: "",
  MATRICULE:"",
  ID_PROFIL: null,
  IMAGE: null
};

export default function Utilisateur_Add() {
  const user = useSelector(userSelector);
  const dispacth = useDispatch();
  const [data, handleChange, setData, setValue] = useForm(initialForm);
  const [showCalendar, setShowCalendar] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { ID_UTILISATEUR: encodedStr } = useParams();
  const ID_UTILISATEUR = decodeId(encodedStr);
  const [getutilisateur, setUtilisateur] = useState(null);
  const [loadingUtilisateur, setLoadingUtilisateur] = useState(true);
  const [profil, setProfil] = useState([]);
  const checkProfil = user.ID_PROFIL == PROFILS.CORPORATE

  const { hasError, getError, setErrors, checkFieldData, isValidate, setError, getErrors } = useFormErrorsHandle(data, {
    NOM: {
      required: true,
      length: [1, 250],

    },
    PRENOM: {
      required: true,
      length: [1, 250],
    },
    TELEPHONE: {
      required: true,
      length: [5, 250],
      number: true
    },
    EMAIL: {
      required: true,
      length: [1, 250],
      email: true
    },
    USERNAME: {
      required: true,
      length: [1, 250],
    },
    MATRICULE:{
      required: true,
      length: [1, 255],
      alpha: true
    },
    ID_PROFIL: {
      required: true,
    },
    // IMAGE: {
    //   required: true,
    //   image: 20000000
    // }
  }, {
    NOM: {
      required: "Ce champ est obligatoire",
      alpha: "Le nom  est invalide",
      length: "Le nom ne doit pas depasse max(250 caractères)",
    },
    MATRICULE:{
      required: "Ce champ est obligatoire",
      alpha: "La matricule  est invalide",
      length: "La matricule ne doit pas depasse max(255 caractères)",
    },
    PRENOM: {
      required: "Ce champ est obligatoire",
      alpha: "Le prenom  est invalide",
      length: "Le prenom ne doit pas depasser max(250 caracteres)"
    },
    TELEPHONE: {
      required: "Ce champ est obligatoire",
      length: "Le numero de telephone est invalide",
      number: "Le numero de telephone doit etre un nombre",
    },
    EMAIL: {
      required: "Ce champ est obligatoire",
      alpha: "L'email est invalide",
      length: "Email invalide (max : 250 caractères)",
      unique: "L'adresse email est déjà utilisée",
      email: "L'email est invalide",
    },
    USERNAME: {
      required: "Ce champ est obligatoire",
      alpha: "Nom d'utilisateur invalide",
      length: "Nom invalide (max: 250 caractères)",
    },
    ID_PROFIL: {
      required: "Ce champ est obligatoire",
    },
  });



  const isValid = () => {

    return !getError("NOM") &&
      !getError("PRENOM") &&
      !getError("TELEPHONE") &&
      !getError("EMAIL") &&
      !getError("USERNAME") &&
      !getError("ID_PROFIL") &&
      !getError("IMAGE")
      ? true
      : false;
    return isValidate();
  };



  const handleVisibility = (e) => {
    setShowCalendar(!showCalendar);
  };
  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      // if (!isValid()) return false;
      if (isValidate()) {
        setIsSubmitting(true);
        const form = new FormData();
        form.append("NOM", data.NOM);
        form.append("PRENOM", data.PRENOM);
        form.append("TELEPHONE", data.TELEPHONE);
        form.append("EMAIL", data.EMAIL);
        form.append("USERNAME", data.USERNAME);
        form.append("MATRICULE", data.MATRICULE);
        
        form.append("ID_PROFIL", data.ID_PROFIL.code);
        // form.append("ID_PROFIL", checkProfil ? PROFILS.CORPORATE : data.ID_PROFIL.code);
        form.append("IMAGE", data.IMAGE);
        const res = await fetchApi(`/administration/utilisateurs/update/${ID_UTILISATEUR}`, {
          method: "PUT",
          body: form,
        });
        const connectedUser = JSON.parse(localStorage.getItem("user"))
        // const user = res.result
        const user = res.result.informationUser_json
        // console.log('useruseruseruseruser',user);
        if (connectedUser) {
          const newUser = {
            ...connectedUser,
            ...user
          }
          dispacth(
            setUserAction(newUser),
            setToastAction({
              severity: "success",
              summary: "Utilisateur modifié",
              detail: "L'utilisateur a été modifié avec succès",
              life: 3000,
            })
          );
          localStorage.setItem('user', JSON.stringify(newUser))
        }
        navigate("/utilisateurs");
      } else {
        setErrors(getErrors())
        await wait(500)
        const header = document.querySelector('header')
        const nav = document.querySelector('nav')
        const firstErrorElement = document.querySelector(".p-invalid")
        if (firstErrorElement) {
          var headerHeight = 0
          if (header) headerHeight += header.offsetHeight
          if (nav) headerHeight += nav.offsetHeight
          const scrollPosition = firstErrorElement.getBoundingClientRect().top + window.scrollY - headerHeight;
          window.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
          });
        }

        dispacth(
          setToastAction({
            severity: 'error',
            summary: "Problème de validation des données",
            detail: "Corriger les erreurs mentionnées pour continuer",
            life: 3000
          }));
      }

    } catch (error) {
      console.log(error);
      if (error.httpStatus == "UNPROCESSABLE_ENTITY") {
        setErrors(error.result);
        setErrors(error.result)
        dispacth(setToastAction({
          severity: 'error',
           summary:  "Problème de validation des données",
          detail: "Corriger les erreurs mentionnées pour continuer",
           life: 3000
        }));
        await wait(500)
        const header = document.querySelector('header')
        const nav = document.querySelector('nav')
        const firstErrorElement = document.querySelector(".p-invalid")
        if (firstErrorElement) {
          var headerHeight = 0
          if (header) headerHeight += header.offsetHeight
          if (nav) headerHeight += nav.offsetHeight
          const scrollPosition = firstErrorElement.getBoundingClientRect().top + window.scrollY - headerHeight;
          window.scrollTo({
            top: scrollPosition,
            behavior: 'smooth'
          });
        }
      } else {
        dispacth(
          setToastAction({
            severity: "error",
            summary: "Erreur du système",
            detail:  "Problème inconnu, réessayez plus tard",
            life: 3000,
          })
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

 
  const profil_info = async () => {
    try {
      var url = `/administration/profile/fetch?`;
      const response = await fetchApi(url);
      setProfil(
        response.result.data.map((profil) => {
          return {
            name: profil.DESCRIPTION,
            code: profil.ID_PROFIL,
          };
        })
      );
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    profil_info()
  }, []);

  // administration/utilisateurs/find/:ID_UTILISATEUR
  // administration/utilisateurs/changePWD/:ID_UTILISATEUR
  // administration/utilisateurs/findAllRoleByIdUtil/:ID_UTILISATEUR

  useEffect(() => {
    (async () => {
      try {
        const res = await fetchApi(`/administration/utilisateurs/find/${ID_UTILISATEUR}`);
        const uti = res.result;
        setUtilisateur(uti);
        setData({
          NOM: uti.NOM,
          PRENOM: uti.PRENOM,
          TELEPHONE: uti.TELEPHONE,
          EMAIL: uti.EMAIL,
          USERNAME: uti.USERNAME,
          MATRICULE:uti.MATRICULE,
          IMAGE: uti.IMAGE,
          ID_PROFIL: {
            name: uti.PROFIL.DESCRIPTION,
            code: uti.PROFIL.ID_PROFIL,
          },
        });
      } catch (error) {
        console.log(error);
      } finally {
        setLoadingUtilisateur(false);
      }
    })();
  }, []);

//  {user.ID_PROFIL==PROFILS.ADMIN||user.ID_PROFIL==PROFILS.SUPERADMIN? path: 'utilisateurs':''
//  }


// const plaintePermission = user.PROFIL.profil_roles.find(r => r.ID_ROLE == IDS_ROLES.ADMINISTRATION)
// const hasAccess = plaintePermission && (plaintePermission.CAN_READ || plaintePermission.CAN_WRITE)
// if (!hasAccess) {
//   return <NotFound />
// }

// {plaintePermission && plaintePermission.CAN_WRITE ? <Button
//   label={intl.formatMessage({ id: "liste.nouveau" })}
//   icon="pi pi-plus"
//   size="small"
//   onClick={() => {
//     navigate("/utilisateur/new");
//   }}
// /> : null}



// useEffect(() => {
//   dispatch(setBreadCrumbItemsAction(
//     [
//      user.ID_PROFIL==PROFILS.ADMIN && {
//         path: 'utilisateurs',
//         name: "Utilisateurs",
//       },
//       {
//         path: 'edit_utilisateur',
//         name: "Modifier le profil",
//       }
//     ]) // Supprime les valeurs null ou undefined
//   ));

//   return () => {
//     dispatch(setBreadCrumbItemsAction([]));
//   };
// }, [dispatch, plaintePermission]); // Ajout de dépendances


  useEffect(() => {
    dispacth(setBreadCrumbItemsAction([
      user.ID_PROFIL==PROFILS.ADMIN&&
      {
        path: 'utilisateur',
        name: "Utilisateurs",
      },
      {
        path: 'edit_utilisateur',
        name: "Modifier le profil",
      }
    ]));
    return () => {
      dispacth(setBreadCrumbItemsAction([]));
    };
  }, []);

  document.title = `Twizere | Modifier le profil`

 
  const invalidClass = (name) => (hasError(name) ? "is-invalid" : "");
  if (loadingUtilisateur) {
    return (
      <div className="d-flex justify-content-center align-items-center h-100 w-100">
        <div className="spinner-border" role="status" />
      </div>
    );
  }
  return (
    <>
      {/* <ConfirmDialog closable dismissableMask={true} /> */}
      {isSubmitting ? <Loading /> : null}
      <div className="px-4 py-3 main_content bg-white has_footer">
        <div className="">
          <h1 className="mb-3">{data.NOM + '  ' + data.PRENOM}</h1>
          <hr className="w-100" />
        </div>
        <form className="form w-80 mt-5" onSubmit={handleSubmit}>
          <div className="form-group col-sm">
            <div className="row">
              <div className="col-md-2">
                <label htmlFor="Nom" className="label">
                 Nom
                </label>
              </div>
              <div className="col-sm">
                <InputText
                  type="text"
                  placeholder="Ecrire le nom"
                  id="NOM"
                  name="NOM"
                  value={data.NOM}
                  onChange={handleChange}
                  onBlur={checkFieldData}
                  className={`w-100 ${hasError("NOM") ? "p-invalid" : ""}`}
                />
                <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
                  {hasError("NOM") ? getError("NOM") : ""}
                </div>
              </div>

              <div className="col-md-2">
                <label htmlFor="PRENOM" className="label">
                  Prénom
                </label>
              </div>
              <div className="col-sm">
                <InputText
                  type="text"
                  placeholder="Ecrire le prenom"
                  id="PRENOM"
                  name="PRENOM"
                  value={data.PRENOM}
                  onChange={handleChange}
                  onBlur={checkFieldData}
                  className={`w-100 ${hasError("PRENOM") ? "p-invalid" : ""}`}
                />
                <div
                  className="invalid-feedback"
                  style={{ minHeight: 21, display: "block" }}
                >
                  {hasError("PRENOM") ? getError("PRENOM") : ""}
                </div>
              </div>

            </div>

            <div className="row">
              <div className="col-md-2">
                <label htmlFor="TELEPHONE" className="label mb-1">
                 Téléphone
                </label>
              </div>
              <div className="col-sm">
                <InputText
                  type="text"
                  placeholder="Ecrire le numéro de téléphone"
                  id="TELEPHONE"
                  name="TELEPHONE"
                  value={data.TELEPHONE}
                  onChange={handleChange}
                  onBlur={checkFieldData}
                  className={`w-100 ${hasError("TELEPHONE") ? "p-invalid" : ""
                    }`}
                />
                <div
                  className="invalid-feedback"
                  style={{ minHeight: 21, display: "block" }}
                >
                  {hasError("TELEPHONE") ? getError("TELEPHONE") : ""}
                </div>
              </div>

              <div className="col-md-2">
                <label htmlFor="EMAIL" className="label mb-1">
                 Email
                </label>
              </div>
              <div className="col-sm">
                <InputText
                  type="text"
                  placeholder="Ecrire l'email"
                  id="EMAIL"
                  name="EMAIL"
                  value={data.EMAIL}
                  onChange={handleChange}
                  onBlur={checkFieldData}
                  className={`w-100 ${hasError("EMAIL") ? "p-invalid" : ""}`}
                />
                <div
                  className="invalid-feedback"
                  style={{ minHeight: 21, display: "block" }}
                >
                  {hasError("EMAIL") ? getError("EMAIL") : ""}
                </div>
              </div>

            </div>

            <div className="row">
              <div className="col-md-2">
                <label htmlFor="USERNAME" className="label mb-1">
                Nom d'utilisateur
                </label>
              </div>
              <div className="col-sm">
                <InputText
                  type="text"
                  placeholder="Ecrire le nom d'utilisateur"
                  id="USERNAME"
                  name="USERNAME"
                  value={data.USERNAME}
                  onChange={handleChange}
                  onBlur={checkFieldData}
                  className={`w-100 ${hasError("USERNAME") ? "p-invalid" : ""}`}
                />
                <div
                  className="invalid-feedback"
                  style={{ minHeight: 21, display: "block" }}
                >
                  {hasError("USERNAME") ? getError("USERNAME") : ""}
                </div>
              </div>

              <div className="col-md-2">
                <label htmlFor="MATRICULE" className="label mb-1">
                Matricule
                </label>
              </div>
              <div className="col-sm">
                <InputText
                  type="text"
                  placeholder="Ecrire le matricule"
                  id="MATRICULE"
                  name="MATRICULE"
                  value={data.MATRICULE}
                  onChange={handleChange}
                  onBlur={checkFieldData}
                  className={`w-100 ${hasError("MATRICULE") ? "p-invalid" : ""}`}
                />
                <div
                  className="invalid-feedback"
                  style={{ minHeight: 21, display: "block" }}
                >
                  {hasError("MATRICULE") ? getError("MATRICULE") : ""}
                </div>
              </div>
            </div>


            <div className="row">
              <div className="col-md-2">
                <label htmlFor="ID_PROFIL" className="label mb-1">
                 Role
                </label>
              </div>
              <div className="col-sm">
                <Dropdown
                  value={data.ID_PROFIL}
                  options={profil}
                  onChange={(e) => setValue("ID_PROFIL", e.value)}
                  optionLabel="name"
                  id="ID_PROFIL"
                  filter
                  filterBy="name"
                  placeholder="Selectionner le profile"
                  emptyFilterMessage="Aucun élément trouvé "
                  emptyMessage="Aucun élément trouvé"
                  name="ID_PROFIL"
                  onHide={() => {
                    checkFieldData({ target: { name: "ID_PROFIL" } });
                  }}
                  className={`w-100 ${hasError("ID_PROFIL") ? "p-invalid" : ""
                    }`}
                  showClear
                />
                <div
                  className="invalid-feedback"
                  style={{ minHeight: 21, display: "block" }}
                >
                  {hasError("ID_PROFIL") ? getError("ID_PROFIL") : ""}
                </div>
              </div>
              <div className="col-md-2">
                <label htmlFor="Photo" className="label mb-1">
                 Profile
                </label>
              </div>
              <div className="col-sm">
                <div className="mb-1">
                  <Image
                    src={getutilisateur?.IMAGE}
                    alt="Image"
                    className="rounded"
                    imageClassName="rounded "
                    width="80"
                    height="80"
                    imageStyle={{ objectFit: "cover" }}
                    preview
                  />
                </div>
                <FileUpload
                  chooseLabel="Choisir l'image"
                  cancelLabel="Annuler"
                  name="image"
                  uploadOptions={{
                    style: { display: "none" },
                  }}
                  // className="p-invalid"
                  accept="image/*"
                  maxFileSize={4000000}
                  invalidFileSizeMessageDetail="Image trop lourde"
                  emptyTemplate={ <p className="m-0"> Glisser et déposez l'image ici. </p> }
                  onSelect={async (e) => {
                    const file = e.files[0];
                    setValue("IMAGE", file);
                  }}
                  onClear={() => {
                    setError("IMAGE", {});
                  }}
                  className={`${hasError("IMAGE") ? "p-invalid" : ""}`}
                />
                <div
                  className="invalid-feedback"
                  style={{ minHeight: 21, display: "block" }}
                >
                  {hasError("IMAGE") ? getError("IMAGE") : ""}
                </div>
              </div>
            </div>
          </div>


          <div style={{ position: "absolute", bottom: 0, right: 0 }} className="w-100 d-flex justify-content-end shadow-4 pb-3 pr-5 bg-white" >
            <Button
              label= "Réinitialiser"
              type="reset"
              outlined
              className="mt-3"
              size="small"
              onClick={(e) => {
                e.preventDefault();
                setData(initialForm);
                setErrors({});
              }}
            />
            <Button
              label="Modifier"
              type="submit"
              className="mt-3 ml-3"
              size="small"
              disabled={isSubmitting}
            />
          </div>
        </form>
      </div>
    </>
  );
}
