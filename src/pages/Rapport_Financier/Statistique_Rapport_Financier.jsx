import { Link, Outlet, useNavigate, useNavigation } from "react-router-dom";
import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setBreadCrumbItemsAction, setToastAction, } from "../../store/actions/appActions";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dialog } from 'primereact/dialog';
import fetchApi from "../../helpers/fetchApi";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import { SlideMenu } from "primereact/slidemenu";
import Loading from "../../components/app/Loading";
import { Dropdown } from "primereact/dropdown";
import { Image } from "primereact/image";
import { InputSwitch } from 'primereact/inputswitch';
import { Tooltip } from 'primereact/tooltip';
import { encodeId } from "../../utils/IdEncryption";
import statutCreditsColor from "../../helpers/statutCreditsColor";
import modePaiementDetailColor from "../../helpers/modePaiementDetailColor";
import { userSelector } from "../../store/selectors/userSelector";
import { useFormErrorsHandle } from "../../hooks/useFormErrorsHandle";
import wait from "../../helpers/wait";
import { Calendar } from "primereact/calendar";
import { useForm } from "../../hooks/useForm";
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import entete from "../../../public/images/nodebu.png";
import moment from "moment";
import PROFILS from "../../constants/PROFILS";



export default function Statistique_Rapport_Financier() {

    const initialForm = {
        TYPE: null,
        PARIODE: null,
        DESCRIPTION: '',
        PERIODE_NUMERIQUE: "",
        DATE_BILAN: null

    };
    const [dates, setDates] = useState(null);

    const [isVisible, setIsVisible] = useState(false);
    const [selectAll, setSelectAll] = useState(false);
    const user = useSelector(userSelector);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [totalRecordsMembre, settotalRecordsMembre] = useState(0);
    const [TotalcotisationFemmes, setTotalcotisationFemmes] = useState(0);
    const [TotalcotisationHommes, setTotalcotisationHommes] = useState(0);
    const [credits, setCredits] = useState([]);
    const [montantTotalCredit, setmontantTotalCredit] = useState(0);
    const [TotalMontantCreditsFemme, setTotalMontantCreditsFemme] = useState(0);
    const [TotalMontantCreditsHomme, setTotalMontantCreditsHomme] = useState(0);
    const [nombreCreditsSainsHommes, setnombreCreditsSainsHommes] = useState(null);
    const [nombreCreditsSainsFemmes, setnombreCreditsSainsFemmes] = useState(null);
    const [montantTotalSainsHommes, setmontantTotalSainsHommes] = useState(null);
    const [montantTotalSainsFemmes, setmontantTotalSainsFemmes] = useState(null);

    const [Totaldescotisation, setTotaldescotisation] = useState(null);
    const [nbFemmesayantcotise, setnbFemmesayantcotise] = useState(null);
    const [totalMontantFemmesCredits, settotalMontantFemmesCredits] = useState(null);
    const [totalMontantHommesCredits, settotalMontantHommesCredits] = useState(null);
    const [MontantTotalAccordeAucoursdelaperiode, setMontantTotalAccordeAucoursdelaperiode] = useState(null);

    const [nombreBeneficiaires, setnombreBeneficiaires] = useState(null);
    const [LesFemmesBeneficiareducredits, setLesFemmesBeneficiareducredits] = useState(null);
    const [LeshommesBeneficiareducredits, setLeshommesBeneficiareducredits] = useState(null);


    const [nbHommesayantcotise, setnbHommesayantcotise] = useState(null);
    const [totalCotisationHommes, settotalCotisationHommes] = useState(null);
    const [totalCotisationFemmes, settotalCotisationFemmes] = useState(null);
    const [totalCotisationAnticipe, settotalCotisationAnticipe] = useState(null);
    const [TotalRecordsCredit, setTotalRecordsCredit] = useState(0);
    const [NombreCreditFemme, setNombreCreditFemme] = useState(0);
    const [NombreCreditHomme, setNombreCreditHomme] = useState(0);
    const [cotisationAnticipe, setcotisationAnticipe] = useState(null);
    const [CapitalCreditAccordepaspayes, setCapitalCreditAccordepaspayes] = useState(null)
    const [TotalCharges, setTotalCharges] = useState(null)
    const [InteretsurcotisationAnticipe, setInteretsurcotisationAnticipe] = useState(null);
    const [MontantTotalCapital, setMontantTotalCapital] = useState(null);
    const [MontantReserveGenerale, setMontantReserveGenerale] = useState(null);
    const [Fondspropres, setFondspropres] = useState(null);
    const [CapitalCotisationsMembresanticipecaissesocial, setCapitalCotisationsMembresanticipecaissesocial] = useState(null);
    const [TotalMontantAmortissementAvecFiltreParPeriode, setTotalMontantAmortissementAvecFiltreParPeriode] = useState(null);
    const [Interetsanticipe, setInteretsanticipe] = useState(null);
    const [PénalitésRapport, setPénalitésRapport] = useState(null);
    const [Totalmembresmicrofinance, setTotalmembresmicrofinance] = useState(null);
    const [IntérêtsRapport, setIntérêtsRapport] = useState(null);
    const [Hommesmembresmicrofinance, setHommesmembresmicrofinance] = useState(null);
    const [Commission, setCommission] = useState(null);
    const [Femmessmembresmicrofinance, setFemmessmembresmicrofinance] = useState(null);

    const [bilans, setBilan] = useState([]);
    const [frais, setFrais] = useState([]);
    const [montant, setMontant] = useState(null)
    // const paginatorLeft = <Button type="button" icon="pi pi-refresh" text />;
    // const paginatorRight = <Button type="button" icon="pi pi-download" text />;
    const [selectedItems, setSelectedItems] = useState(null);
    const menu = useRef(null);
    const [globalLoading, setGloabalLoading] = useState(false);
    const [activeButton, setActiveButton] = useState(1)
    const [afficheFrais, setAfficheFrais] = useState(1)
    const [TypesCredits, setTypesCredits] = useState(null)
    const navigate = useNavigate();
    const [data, handleChange, setData, setValue] = useForm(initialForm);
    const [totalvaleurAmortissement, setTotalvaleurAmortissement] = useState(null)
    const [totalActif, setTotalActif] = useState(null)
    const [creance, setCreance] = useState(null)
    const [banque, setBanque] = useState(null)
    const [MembreNombre, setMembreNombre] = useState(null)
    const [nombresCreditsucoursdelaperiode, setnombresCreditsucoursdelaperiode] = useState(null)
    const [caisse, setCaisse] = useState(null)
    const [valeurbrute, setValeur_brutte] = useState(null)
    const [totalresultant, setTotalresultant] = useState(null)
    const [valeurnette, setValeur_nette] = useState(null)
    const [totalcaisse_social, setTotalcaisse_social] = useState(null)
    const [total_passif, setTotal_passif] = useState(null)
    const [montResiduel, setMontResiduel] = useState(null)
    const [totalCapital, setTotalCapital] = useState(null)
    const [pdfUrl, setPdfUrl] = useState(null);
    const [membres_microfinance, setMembres_microfinance] = useState(null);
    const [Femmes, SetFemmes] = useState(null);
    const [Hommes, SetHommes] = useState(null);

    const [HommesCotisation, SetHommesCotisation] = useState(null);
    const [FemmesCotisation, SetFemmesCotisation] = useState(null);
    const [TotalActive, setTotalActive] = useState();

    const [CapitalCreditAccordeTotal, setCapitalCreditAccordeTotal] = useState(null);//MontantTotalsCreditsAccordes
    const [MontantTotalCreditsAccordes, setMontantTotalCreditsAccordes] = useState(null);
    const [interetTotalCreditsAccorde, setinteretTotalCreditsAccorde] = useState(null);
    const [CapitalTotCreditRembourse, setCapitalTotCreditRembourse] = useState(null);
    const [interetTotalCreditRembourse, setInteretTotalCreditRembourse] = useState(null);
    const [MontantTatalCreditsRembourses, setMontantTatalCreditsRembourses] = useState(null);
    const [CapitalTotalRestantdu, setCapitalTotalRestantdu] = useState(null);
    const [InteretTotalCapitalRestantDu, setInteretTotalCapitalRestantDu] = useState(null);
    const [MontantToatalCapitalRestantDu, setMontantToatalCapitalRestantDu] = useState(null);
    const [Intérêts, setIntérêts] = useState(null);
    const [Pénalités, setPénalités] = useState(null);
    const isMembre = user.ID_PROFIL
    const [CaisseSocialSoldedisponible, setCaisseSocialSoldedisponible] = useState(null);
    const [CaisseSocial, setCaisseSocial] = useState(null);
    const [Montantcaisse, setMontantcaisse] = useState(null);
    const [MontantDepenses, setMontantDepenses] = useState(null);
    const [Montantbancaire, setMontantbancaire] = useState(null);
    const [MontantCompteInterne, setMontantCompteInterne] = useState(null);
    const [CapitalTotalCotisationsMembres, setCapitalTotalCotisationsMembres] = useState(null);
    const [CapitalTotalFraisAdhions, setCapitalTotalFraisAdhions] = useState(null);//FraisAdhions
    const [CapitalTotalCommissionRemboursement, setCapitalTotalCommissionRemboursement] = useState(null);
    const [InteretsReel, setInteretsReel] = useState(null);
    const [InteretsEstimatif, setInteretsEstimatif] = useState(null);
    const [CaisseBank, setCaisseBank] = useState(null);

    const [type, setType] = useState([
        {
            code: 0,
            name: "Ouverture"
        },
        {
            code: 1,
            name: "Clôture"
        },

    ])
    const [periode, setPeriode] = useState([
        {
            code: 0,
            name: 'Mensuel'
        },
        {
            code: 1,
            name: 'Trimestriel'
        },
        {
            code: 2,
            name: 'Annuel'
        },

    ]);
    const [lazyState, setlazyState] = useState({
        first: 0,
        rows: 10,
        page: 1,
        sortField: null,
        sortOrder: null,
        search: "",
        filters: {
            name: { value: "", matchMode: "contains" },
            "country.name": { value: "", matchMode: "contains" },
            company: { value: "", matchMode: "contains" },
            "representative.name": { value: "", matchMode: "contains" },
        },
    });

    const { hasError, getError, setErrors, checkFieldData, isValidate, setError, getErrors } = useFormErrorsHandle(data, {

        TYPE: {
            required: false,
        },
        DESCRIPTION: {
            required: false,
        },
        PERIODE: {
            required: false,
        },
        PERIODE_NUMERIQUE: {
            required: false,
            number: true
        },
    },
        {
            PERIODE_NUMERIQUE: {
                required: "Ce champ est obligatoire",
                number: "Il faut mettre un nombre entier"
            },
            DATE_BILAN: {
                required: "Ce champ est obligatoire",

            },
            TYPE: {
                required: "Ce champ est obligatoire",

            },
            PERIODE: {
                required: "Ce champ est obligatoire",

            },
            DESCRIPTION: {
                required: "Ce champ est obligatoire",
            },



        });

    const dispacth = useDispatch();
    const handleVisibility = (e) => {
        setIsVisible(!isVisible);
    };
    const onPage = (event) => {
        setlazyState(event);
    };

    const onSort = (event) => {
        setlazyState(event);
    };

    const onFilter = (event) => {
        event["first"] = 0;
        setlazyState(event);
    };

    const onSelectionChange = (event) => {
        const value = event.value;
        setSelectedItems(value);
        setSelectAll(value.length === totalRecords);
    };

    const onSelectAllChange = (event) => {
        const selectAll = event.checked;

        if (selectAll) {
            setSelectAll(true);
            setSelectedItems(credits);
        } else {
            setSelectAll(false);
            setSelectedItems([]);
        }
    };

    const fetchMontantTotalCredits = useCallback(async () => {
        try {
            setLoading(true);

            let url = "/RapportFinancier/findCoutRevenuCredits/fetch?";
            if (dates) {
                const [startDate, endDate] = dates;
                if (startDate) {
                    url += `startDate=${startDate.toISOString()}&`;
                }
                if (endDate) {
                    url += `endDate=${endDate.toISOString()}&`;
                }
            }
            const res = await fetchApi(url);
            // Mise à jour selon la structure du backend corrigé
            setCapitalCreditAccordeTotal(Number(res.result?.CapitalCreditAccorde) || 0);
            setMontantTotalCreditsAccordes(Number(res.result?.MontantTotalsCreditsAccordes))
            setinteretTotalCreditsAccorde(Number(res.result?.interetCreditAccordereel))
            setCapitalTotCreditRembourse(Number(res.result?.CapitalTotRembourse))
            setInteretTotalCreditRembourse(Number(res.result?.interetCreditRembourse))
            setMontantTatalCreditsRembourses(Number(res.result?.MontantTotalCreditsRembourse))
            setCapitalTotalRestantdu(Number(res.result?.CapitalRestantDu))
            setInteretTotalCapitalRestantDu(Number(res.result?.InteretCapitalRestantDu))
            setMontantToatalCapitalRestantDu(Number(res.result?.MontantCapitalRestantDu))
            setIntérêts(Number(res.result?.InteretTotdejapaye))
            setTypesCredits(res.result.TypesCredits)
            settotalMontantHommesCredits(Number(res.result.totalMontantHommesCredits))
            settotalMontantFemmesCredits(Number(res.result.totalMontantFemmesCredits))
            setMontantTotalAccordeAucoursdelaperiode(Number(res.result.MontantTotalAccordeAucoursdelaperiode))
            settotalCotisationAnticipe(Number(res.result.totalCotisationUniques))
            settotalCotisationFemmes(Number(res.result.totalCotisationHommes))
            settotalCotisationHommes(Number(res.result.totalCotisationHommes))
            setTotaldescotisation(res.result.Totaldescotisation)
            setnombreCreditsSainsHommes(Number(res.result.nombreCreditsSainsHommes))
            setnombreCreditsSainsFemmes(Number(res.result.nombreCreditsSainsFemmes))
            setmontantTotalSainsHommes(Number(res.result.montantTotalSainsHommes))
            setmontantTotalSainsFemmes(Number(res.result.montantTotalSainsFemmes))
            setnombresCreditsucoursdelaperiode(res.result.nombresCreditsucoursdelaperiode)
            setnombreBeneficiaires(res.result.nombreBeneficiaires)
            setLeshommesBeneficiareducredits(res.result.LeshommesBeneficiareducredits)
            setLesFemmesBeneficiareducredits(res.result.LesFemmesBeneficiareducredits)
            setnbFemmesayantcotise(res.result.nbFemmesayantcotise)
            setnbHommesayantcotise(res.result.nbHommesayantcotise)
            setcotisationAnticipe(Number(res.result.CapitalCotisationsMembresanticipe))
            setCapitalCreditAccordepaspayes(Number(res.result.CapitalCreditAccordepaspayes))
            setPénalités(Number(res.result?.CapitalTotPenalite))
            setMontantcaisse(Number(res.result?.MontantTOtalCraiditDebitCaisse))
            setMontantbancaire(Number(res.result?.MontantTOtalCraiditDebitBancaire))
            setMontantCompteInterne(Number(res.result?.MontantTotalCompteInterne))
            setCapitalTotalFraisAdhions(Number(res.result?.CapitalFraisAdhions))
            setInteretsurcotisationAnticipe(Number(res.result.InteretsurcotisationAnticipe))
            setCapitalTotalCommissionRemboursement(Number(res.result?.CapitalCommissionRemboursement))
            setMontantDepenses(Number(res?.result?.Depenses))
            setMontantTotalCapital(Number(res?.result?.CapitalCotisationsMembres))
            setInteretsReel(Number(res.result?.Interetsreel))
            setInteretsEstimatif(Number(res.result?.interetCreditAccordereel))
            setCaisseSocial(Number(res.result?.MontantTotalcaissesocial))
            setCaisseSocialSoldedisponible(Number(res.result.SoldeDisponibleCaisseSocial))
            setFemmessmembresmicrofinance(res.result.Femme)
            setHommesmembresmicrofinance(res.result.hommee)

            setTotalmembresmicrofinance(res.result.NombresMembresmicro)
        } catch (error) {
            console.error("Erreur lors de la récupération des crédits :", error);
        } finally {
            setLoading(false);
        }
    }, [dates]);

    useEffect(() => {
        fetchMontantTotalCredits();
    }, [dates]);
    //fonction pour lister les frais d'adhesion
    const fetchBilan = useCallback(async () => {
        try {
            setLoading(true);
            const baseurl = `/RapportFinancier/Bilantempsreel/fetchTempsreel?`;

            var url = baseurl;
            if (dates) {
                const [startDate, endDate] = dates;
                if (startDate) {
                    url += `startDate=${startDate.toISOString()}&`;
                }
                if (endDate) {
                    url += `endDate=${endDate.toISOString()}&`;
                }
            }

            const res = await fetchApi(url);
            setTotalvaleurAmortissement(res.result.totalvaleurAmortissement);
            setTotalActive(res.result.TotalcreditAccordeValeurNette)
            setTotalCharges(res.result?.totalChargeDepenses)
            setTotalRecords(res.result.totalRecords);
            setTotalCapital(res.result.totalCapital)
            setMontResiduel(res.result.montResiduel)
            setTotalresultant(res.result.totalresultant)
            setCreance(res.result.creances)
            setBanque(res.result.banque)
            setMontantReserveGenerale(Number(res.result.MontantReservegenerale))
            setFondspropres(Number(res?.result?.Fonds_propres))
            setCapitalTotalCotisationsMembres(Number(res?.result?.Cotisationmembres))
            setCapitalCotisationsMembresanticipecaissesocial(Number(res.result.CapitalCotisationsMembresanticipecaissesocial))
            setTotalMontantAmortissementAvecFiltreParPeriode(Number(res.result.TotalMontantAmortissementAvecFiltreParPeriode))
            setInteretsanticipe(Number(res.result.MontantProduitsFixeAutresProduits))
            setPénalitésRapport(Number(res.result.PenalitesMontantsurcreditsretards))
            setCommission(Number(res.result.CommissionMontant))
            setIntérêtsRapport(Number(res.result.InteretTotdejapaye))
            setCaisse(res.result.caisse)
            setValeur_brutte(res.result.totalvaleurbrutte)
            setTotalcaisse_social(res.result.totalcaisse_social)
            setValeur_nette(res.result.totalvaleurnetteMaintenant)
            setTotalActif(res.result.totalActif)
            setTotal_passif(res.result.total_passif)

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [lazyState, dates]);

    useEffect(() => {
        fetchBilan();
    }, [lazyState, dates]);

    const fetchmembre_microfinance = useCallback(async () => {
        try {
            setLoading(true);
            let url = `/administration/utilisateurs/fetch?rows=10000000&profile=${PROFILS.MEMBRE}`;

            for (let key in lazyState) {
                const value = lazyState[key];

                if (value) {
                    if (typeof value == "object") {
                        url += `${key}=${JSON.stringify(value)}&`;
                    } else {
                        url += `${key}=${value}&`;
                    }
                }
            }
            // console.log('url',url);

            const res = await fetchApi(url);
            const Sexe = res.result.data
            //const Hommes = Sexe.filter(Sex, homme)

            const Hommees = Sexe.filter(
                (Hommes) => parseInt(Hommes?.membre.SEXE) === 0)
            const Femmes = Sexe.filter(
                (Femme) => parseInt(Femme?.membre.SEXE) === 1)
            SetHommes(Hommees.length)
            SetFemmes(Femmes.length)
            setMembres_microfinance(res.result.data);
            setTotalRecords(res.result.totalRecords);
            setMembreNombre(res.result.totalRecords)


        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [lazyState,]);
    useEffect(() => {
        fetchmembre_microfinance();
    }, [lazyState])

    // console.log(bilans, "Liste")

    useEffect(() => {
        document.title = "STATISTIQUE DES ACTIVITES"
        dispacth(setBreadCrumbItemsAction([
            {
                path: 'STATISTIQUE',
                name: 'Statistique'
            },
        ]));
        return () => {
            dispacth(setBreadCrumbItemsAction([]));
        };
    }, []);

    const [period, setPeriod] = useState([
        {
            code: 0,
            name: "Mensuel"
        },
        {
            code: 1,
            name: "Trimestriel"
        },
        {
            code: 2,
            name: "Annuel"
        },
    ])


    const handleToggle = () => {
        setIsVisible(!isVisible);
    };

    const periodesSelected = async (periode) => {
        setPeriode(periode);

    };
    // const handleSubmit = async (e) => {
    //     try {
    //         //   e.preventDefault();
    //         if (isValidate()) {
    //             // setIsSubmitting(true);
    //             const form = new FormData();
    //             // form.append("TYPE", data.TYPE.code);
    //             form.append("NOMBRE_MEMBRE_PERIODE_N", parseFloat(MontantCompteInterne).toFixed(2));
    //             form.append("NOMBRE_MEMBRE_PERIODE_HOMME_N", 0);
    //             form.append("NOMBRE_MEMBRE_PERIODE_FEMME_N", 0);
    //             form.append("NOMBRE_MEMBRE_PERIODE_N_1", TotalMontantAmortissementAvecFiltreParPeriode);
    //             form.append("NOMBRE_MEMBRE_PERIODE_HOMME_N_1", cotisationAnticipe);
    //             form.append("NOMBRE_MEMBRE_PERIODE_FEMME_N_1", 0);
    //             form.append("NOMBRE_MEMBRE_AUTRE_PERSONNE_MORALE_N_", FondsPropres);
    //             form.append("NOMBRE_MEMBRE_AUTRE_PERSONNE_MORALE_N_1", MontantCapital);
    //             form.append("NOMBRE_PERSONNE_COTISE_N", Resultas);
    //             form.append("NOMBRE_PERSONNE_COTISE_N_1", TotalActif);
    //             form.append("NOMBRE_PERSONNE_COTISE_HOMME_N", 0);
    //             form.append("NOMBRE_PERSONNE_COTISE_FEMME_N", 0);
    //             form.append("NOMBRE_PERSONNE_COTISE_HOMME_N_1", 0);
    //             form.append("NOMBRE_PERSONNE_COTISE_FEMME_N_1", 0);
    //             form.append("AUTRE_PERSONNE_COTISE_FEMME_N", 0);
    //             form.append("AUTRE_PERSONNE_COTISE_FEMME_N_1", 0)
    //             form.append("MONTANT_COTISATION_N", 0);
    //             form.append("MONTANT_COTISATION_N_1", 0);
    //             form.append("MONTANT_COTISATION_HOMME_N", MontantReserveGenerale);
    //             form.append("MONTANT_COTISATION_FEMME_N", 0);
    //             form.append("MONTANT_COTISATION_HOMME_N_1", 0);
    //             form.append("MONTANT_COTISATION_FEMME_N_1", 0);
    //             form.append("MONTANT_AUTRE_COTISATION_N", ProduitsInterets);
    //             form.append("MONTANT_AUTRE_COTISATION_N_1", TotalMontantAmortissementAvecFiltreParPeriode);
    //             form.append("NOMBRE_BENEFICIARE_CREDITS_N", InteretsurcotisationAnticipe);
    //             form.append("NOMBRE_BENEFICIARE_CREDITS_N_1", Resultas < 0 ? Resultas : 0);
    //             form.append("NOMBRE_BENEFICIARE_HOMME_CREDITS_N", TotalProduits);
    //             form.append("NOMBRE_BENEFICIARE_FEMME_CREDITS_N", 0);
    //             form.append("NOMBRE_BENEFICIARE_HOMME_CREDITS_N_1", CapitalCreditAccordepaspayes);
    //             form.append("NOMBRE_BENEFICIARE_FEMME_CREDITS_N_1", InteretsurcotisationAnticipe);
    //             form.append("AUTRES_BENEFICIARE_FEMME_CREDITS_N", 0);
    //             form.append("AUTRES_BENEFICIARE_FEMME_CREDITS_N_1", 0);
    //             form.append("MONTANT_CREDITS_OCTROIT_N", 0);
    //             form.append("MONTANT_CREDITS_OCTROIT_N_1", TotalCharges);
    //             form.append("MONTANT_CREDITS_OCTROIT_N", 0);
    //             form.append("MONTANT_CREDITS_OCTROIT_HOMME_N", Resultas > 0 ? Resultas : 0);
    //             form.append("MONTANT_CREDITS_OCTROIT_FEMME_N", 0);
    //             form.append("MONTANT_CREDITS_OCTROIT_HOMME_N_1", 0);
    //             form.append("MONTANT_CREDITS_OCTROIT_FEMME_N_1", MontantTotalCharges);
    //             form.append("MONTANT_AUTRE_CREDITS_OCTROIT_HOMME_N", 0);
    //             form.append("MONTANT_AUTRE_CREDITS_OCTROIT_HOMME_N_1", TotalPassif);
    //             form.append("NOMBRE_CREDITS_SAINS_N", 0);
















    //             form.append("NOMBRE_CREDITS_SAINS_N_1", Resultas < 0 ? Resultas : 0);
    //             form.append("NOMBRE_CREDITS_SAINS_HOMME_N", TotalProduits);
    //             form.append("NOMBRE_CREDITS_SAINS_FEMME_N", 0);
    //             form.append("NOMBRE_AUTRES_CREDITS_SAINS_N", CapitalCreditAccordepaspayes);
    //             form.append("NOMBRE_AUTRES_CREDITS_SAINS_N_1", InteretsurcotisationAnticipe);
    //             form.append("MONTANT_CREDITS_SAINS_N", 0);
    //             form.append("MONTANT_CREDITS_SAINS_N_1", 0);
    //             form.append("MONTANT_CREDITS_SAINS_FEMME_N", 0);
    //             form.append("MONTANT_CREDITS_SAINS_HOMME_N", TotalCharges);
    //             form.append("MONTANT_CREDITS_SAINS_HOMME_N_1", 0);
    //             form.append("MONTANT_CREDITS_SAINS_FEMME_N_1", Resultas > 0 ? Resultas : 0);
    //             form.append("MONTANT_AUTRE_CREDITS_SAINS_N", 0);
    //             form.append("MONTANT_AUTRE_CREDITS_SAINS_N_1", 0);
    //             form.append("MONTANT_CREDITS_OCTROIT_FEMME_N_1", MontantTotalCharges);
    //             form.append("MONTANT_AUTRE_CREDITS_OCTROIT_HOMME_N", 0);
    //             form.append("MONTANT_AUTRE_CREDITS_OCTROIT_HOMME_N_1", TotalPassif);
    //             form.append("NOMBRE_CREDITS_SAINS_N", 0);





    //             const res = await fetchApi(`/bilan/rapportFinanciere/createRapport`, {
    //                 method: "POST",
    //                 body: form,
    //             });


    //             dispacth(
    //                 setToastAction({
    //                     severity: "success",
    //                     summary: "bilan enregistré",
    //                     detail: "Bilan a été enregistré avec succès",
    //                     life: 3000,
    //                 })
    //             );

    //             const resultant = res.result
    //             navigate(`/Rapport`);
    //             //setShowAddPageFrais(true)
    //         } else {
    //             console.log(getErrors());
    //             setErrors(getErrors());
    //             dispacth(
    //                 setToastAction({
    //                     severity: "error",
    //                     summary: "La validation des données a échouée",
    //                     detail: "Veuillez corriger les erreurs mentionnées pour continuer",
    //                     life: 3000,
    //                 })
    //             );
    //             await wait(500);
    //             const header = document.querySelector("header");
    //             const nav = document.querySelector("nav");
    //             const firstErrorElement = document.querySelector(".p-invalid");
    //             if (firstErrorElement) {
    //                 var headerHeight = 0;
    //                 if (header) headerHeight += header.offsetHeight;
    //                 if (nav) headerHeight += nav.offsetHeight;
    //                 const scrollPosition =
    //                     firstErrorElement.getBoundingClientRect().top +
    //                     window.scrollY -
    //                     headerHeight;
    //                 window.scrollTo({
    //                     top: scrollPosition,
    //                     behavior: "smooth",
    //                 });
    //             }
    //         }
    //     } catch (error) {
    //         console.log(error);
    //         if (error.httpStatus == "UNPROCESSABLE_ENTITY") {
    //             setErrors(error.result);
    //             dispacth(
    //                 setToastAction({
    //                     severity: "error",
    //                     summary: "Erreur du système",
    //                     detail: "Erreur du système, réessayez plus tard",
    //                     life: 3000,
    //                 })
    //             );
    //             await wait(500);
    //             const header = document.querySelector("header");
    //             const nav = document.querySelector("nav");
    //             const firstErrorElement = document.querySelector(".p-invalid");
    //             if (firstErrorElement) {
    //                 var headerHeight = 0;
    //                 if (header) headerHeight += header.offsetHeight;
    //                 if (nav) headerHeight += nav.offsetHeight;
    //                 const scrollPosition =
    //                     firstErrorElement.getBoundingClientRect().top +
    //                     window.scrollY -
    //                     headerHeight;
    //                 window.scrollTo({
    //                     top: scrollPosition,
    //                     behavior: "smooth",
    //                 });
    //             }
    //         } else {
    //             dispacth(
    //                 setToastAction({
    //                     severity: "error",
    //                     summary: "Erreur du système",
    //                     detail: "Erreur du système, réessayez plus tard",
    //                     life: 3000,
    //                 })
    //             );
    //         }
    //     } finally {
    //         //   setIsSubmitting(false);
    //     }
    // };

    const exportPdf = () => {
        const pageWidth = 210;
        const pageHeight = 297;
        const doc = new jsPDF({ orientation: "paysage", unit: "mm", format: 'a4' });

        // Ajouter l'image importée
        doc.addImage(entete, "JPEG", 0, 2, 70, 30);

        // Titre sous l'image
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        doc.text(`Bilan en Temps Réel - ${moment(Date()).format("DD/MM/YYYY")}`, 100, 40, { align: "center" });

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");

        // Définir les colonnes pour les actifs
        const actifColumns = [
            { title: "N° Compte", dataKey: "numeroCompte" },
            { title: "Libelle", dataKey: "libelle" },
            { title: "Valeur Brute", dataKey: "valeurBrute" },
            { title: "Valeur Résiduelle", dataKey: "valeurResiduelle" },
            { title: "Amortissement", dataKey: "amortissement" },
            { title: "Valeur Nette", dataKey: "valeurNette" },
        ];

        // Données pour les actifs
        const actifData = [
            {
                numeroCompte: "223",
                libelle: "Équipements/Matériel",
                valeurBrute: `${(valeurbrute)} FBu`,
                valeurResiduelle: `${(montResiduel)} FBu`,
                amortissement: `${(totalvaleurAmortissement)} FBu`,
                valeurNette: `${(valeurnette)} FBu`,
            },
            {
                numeroCompte: "202",
                libelle: "Créance",
                valeurBrute: `${(creance)} FBu`,
                valeurResiduelle: "",
                amortissement: "",
                valeurNette: `${(creance)} FBu`,
            },
            {
                numeroCompte: "201",
                libelle: "Banque",
                valeurBrute: `${(banque)} FBu`,
                valeurResiduelle: "",
                amortissement: "",
                valeurNette: `${(banque)} FBu`,
            },
            {
                numeroCompte: "401",
                libelle: "Caisse",
                valeurBrute: `${(caisse)} FBu`,
                valeurResiduelle: "",
                amortissement: "",
                valeurNette: `${(caisse)} FBu`,
            },
        ];

        // Ajout des actifs au PDF
        doc.autoTable({
            startY: 45,
            head: [actifColumns.map(col => col.title)],
            body: actifData.map(item => [
                item.numeroCompte,
                item.libelle,
                item.valeurBrute,
                item.valeurResiduelle,
                item.amortissement,
                item.valeurNette,
            ]),
            margin: { top: 10, left: 5, right: 5 },
            styles: {
                fontSize: 9,
                cellPadding: 2,
                overflow: 'linebreak',
                halign: 'left',
                valign: 'middle',
            },
            headStyles: {
                fillColor: [251, 140, 140], // Couleur de fond pour l'en-tête
            },
        });

        // Ajouter les passifs de manière similaire
        const passifColumns = [
            { title: "N° Compte", dataKey: "numeroCompte" },
            { title: "Libelle", dataKey: "libelle" },
            { title: "Montant", dataKey: "montant" },
        ];

        // Données pour les passifs
        const passifData = [
            {
                numeroCompte: "300",
                libelle: "Capital",
                montant: `${(totalCapital)} FBu`,
            },
            {
                numeroCompte: "303",
                libelle: "Resultant",
                montant: `${(totalresultant)} FBu`,
            },
            {
                numeroCompte: "402",
                libelle: "Caisse Social",
                montant: `${(totalcaisse_social)} FBu`,
            },
        ];

        // Ajout des passifs au PDF
        doc.autoTable({
            startY: doc.autoTable.previous.finalY + 10, // Démarre après les actifs
            head: [passifColumns.map(col => col.title)],
            body: passifData.map(item => [
                item.numeroCompte,
                item.libelle,
                item.montant,
            ]),
            margin: { top: 10, left: 5, right: 5 },
            styles: {
                fontSize: 9,
                cellPadding: 2,
                overflow: 'linebreak',
                halign: 'left',
                valign: 'middle',
            },
            headStyles: {
                fillColor: [251, 140, 140], // Couleur de fond pour l'en-tête
            },
        });


        // Vérifier la position finale
        const finalY = doc.autoTable.previous.finalY || 0;

        // Ajouter une nouvelle page si le contenu dépasse la zone
        const footerYPosition = pageHeight - 20;
        if (finalY + 20 > footerYPosition) {
            doc.addPage();
        }

        // Positionnement du texte pour le footer
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        // Ajouter ici le texte du footer si nécessaire
        const totalY = doc.autoTable.previous.finalY + 10; // Positionner sous le tableau de charges
        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text("Total actif", 5, totalY);
        doc.text("Total passif", 100, totalY);


        doc.setFontSize(12);
        doc.setFont("helvetica", "normal");
        doc.text(`${totalActif} Fbu`, 5, totalY + 10);
        doc.text(`${total_passif} Fbu`, 100, totalY + 10);


        return doc.output("blob");
    };
    const handleGenerateFacture = (e, itemsIds) => {
        e.preventDefault();
        e.stopPropagation();

        confirmDialog({
            headerStyle: { backgroundColor: '#ecc5c5', backgroundSize: 'cover' },
            headerClassName: "text-black",
            header: "Génerer fichier PDF",
            message: (
                <div className="d-flex flex-column align-items-center">
                    <div className="text-center mt-5">
                        Voulez-vous vraiment générer le PDF ?
                    </div>
                </div>
            ),
            acceptClassName: "p-button-danger",
            acceptLabel: "Oui",
            rejectLabel: "Non",
            accept: () => {
                const blob = exportPdf();
                const url = URL.createObjectURL(blob);
                setPdfUrl(url);
            },
        });
    };
    const fetchCotisation = useCallback(async () => {
        try {
            setLoading(true);
            const baseurl = `/cotisation/cotisations/fetch?rows=100000000000000&`;

            var url = baseurl;
            for (let key in lazyState) {
                const value = lazyState[key];
                if (value) {
                    if (typeof value == "object") {
                        url += `${key}=${JSON.stringify(value)}&`;
                    } else {
                        url += `${key}=${value}&`;
                    }
                }
            }

            const res = await fetchApi(url);
            console.log({ res });


            // ✅ Supprimer les doublons : on garde uniquement la première occurrence par membre

            // ✅ Supprimer les doublons pour avoir la liste des membres uniques
            const membresUniques = Array.from(
                new Map(
                    res.result.data
                        .filter(item => item.MEMBRE_ID && item.TYPE_COTISATION === 1)
                        .map(item => [item.MEMBRE_ID, item])
                ).values()
            );

            // ✅ Le nombre réel de membres ayant cotisé
            const nombreMembresAyantCotise = membresUniques.length;
            console.log({ nombreMembresAyantCotise });
            const montantTotalCotisations = membresUniques.reduce((sum, item) => sum + Number(item.MONTANT || 0), 0)


            console.log(`Membres ayant cotisé: ${montantTotalCotisations}`);


            // ❌ Ce qu'il ne faut PAS faire : 
            // const nombreIncorrect = res.result.data.length; // Donne le nombre total de cotisations

            // ✅ Calcul des frais avec le champ dérivé
            setFrais(
                membresUniques.map(item => ({
                    ...item,
                    NOMBRE_ACTIONS: Number((item.MONTANT || 0) / 328394).toFixed(0)
                }))
            );

            // ✅ Nombre total de membres après dédoublonnage
            settotalRecordsMembre(nombreMembresAyantCotise);
            const Sexe = membresUniques
            const total = res.result.data.reduce((acc, cur) => acc + Number(cur.MONTANT || 0), 0);
            setMontant(montantTotalCotisations)
            console.log({ total });

            const Hommees = Sexe.filter(
                (Hommes) => parseInt(Hommes?.membres.membre.SEXE) === 0)

            const Femmes = Sexe.filter(
                (Femme) => parseInt(Femme?.membres.membre.SEXE) === 1)
            SetHommesCotisation(Hommees.length)
            SetFemmesCotisation(Femmes.length)
            const totalMontantHomme = Hommees.reduce((acc, item) => acc + Number(item.MONTANT || 0), 0);
            const totalMontantFemme = Femmes.reduce((acc, item) => acc + Number(item.MONTANT || 0), 0);
            setTotalcotisationHommes(totalMontantHomme)
            setTotalcotisationFemmes(totalMontantFemme)

        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [lazyState]);

    useEffect(() => {
        fetchCotisation();
    }, [lazyState]);
    const fetchCredit = useCallback(async () => {

        try {
            setLoading(true);
            const baseurl = `/credits/credits/fetch?rows=10000000000000&`;
            var url = baseurl;
            for (let key in lazyState) {
                const value = lazyState[key];
                if (value) {
                    if (typeof value == "object") {
                        url += `${key}=${JSON.stringify(value)}&`;
                    } else {
                        url += `${key}=${value}&`;
                    }
                }
            }
            const res = await fetchApi(url);
            console.log({ res });

            const allcredits = res.result.data;

            // A. SOMMATION des crédits par membre
            const sommations = allcredits.reduce((acc, credit) => {
                const membreId = credit.MEMBRE_ID;
                if (!membreId) return acc;

                if (!acc[membreId]) {
                    acc[membreId] = {
                        membreId: membreId,

                        nomMembre: credit.MEMBRE_ID || 'Inconnu',
                        totalCredits: 0,
                        nombreCredits: 0
                    };
                }

                acc[membreId].totalCredits += Number(credit.MONTANT_DEMANDE) || 0;
                acc[membreId].nombreCredits += 1;

                return acc;
            }, {});

            const creditsParMembre = Object.values(sommations);

            // B. NOMBRE de membres bénéficiaires (sans doublons)
            const nombreMembresUniques = Object.keys(sommations).length;

            // C. TOTAL général de tous les crédits
            const totalGeneralCredits = creditsParMembre.reduce((sum, membre) =>
                sum + membre.totalCredits, 0
            );
            // D. CALCUL Hommes/Femmes CORRIGÉ
            const membresFemmes = creditsParMembre.filter(membre => parseInt(membre.sexe) === 1);
            const membresHommes = creditsParMembre.filter(membre => parseInt(membre.sexe) === 0);

            const totalHommes = membresHommes.reduce((sum, membre) => sum + membre.totalCredits, 0);
            const totalFemmes = membresFemmes.reduce((sum, membre) => sum + membre.totalCredits, 0);

            const nombreHommes = membresHommes.length;
            const nombreFemmes = membresFemmes.length;
            // E. Mettre à jour les states
            setTotalMontantCreditsFemme(totalFemmes)
            setTotalMontantCreditsHomme(totalHommes)
            setNombreCreditHomme(nombreHommes)
            setNombreCreditFemme(nombreFemmes)
            setTotalRecordsCredit(nombreMembresUniques);
            // Compter les membres sans sexe défini
            const membresSansSexe = creditsParMembre.filter(membre =>
                membre.sexe === undefined || membre.sexe === null
            );
            console.log(`Membres sans sexe défini: ${membresSansSexe.length}`);


        } catch (error) {
            console.log(error);
        } finally {
            setLoading(false);
        }
    }, [lazyState,
    ]);

    useEffect(() => {
        fetchCredit();
    }, [lazyState,
    ]);
    return (
        <>

            {globalLoading && <Loading />}
            {pdfUrl ? (
                <>
                    <div className="mt-4">
                        <h1 className="mb-3">Statistique des activites :</h1>
                        <iframe
                            src={pdfUrl}
                            width="100%"
                            height="800px"
                            style={{ border: "1px solid #ccc" }}
                            title="Facture PDF"
                        />
                    </div>
                    <div style={{ position: "absolute", bottom: 0, right: 0 }} className="w-100 d-flex justify-content-end shadow-4 pb-3 pr-5 bg-white">
                        <Button
                            className=" mt-3 ml-3 button-mobile "
                            size="small"
                            type="submit"
                            onClick={() => {
                                URL.revokeObjectURL(pdfUrl); // Libère l'ancien URL
                                setPdfUrl(null);             // Cache l'iframe
                            }}
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-square" viewBox="0 0 16 16">
                                <path d="M14 1a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1zM2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2z" />
                                <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708" />
                            </svg>
                            <span className="ml-1" style={{ fontWeight: 'bold' }}>Fermer PDF</span>
                        </Button>
                    </div>
                </>

            ) : (
                <>
                    <style>{`
            tr {
                height: 20px;
            }
            td {
                padding: 2px;
                text-align: center; /* Centrer les valeurs */
            }
        `}</style>

                    <div className="px-4 py-3 main_content">
                        <div className="d-flex align-items-center justify-content-center">
                            <h3 className="mb-2" style={{ color: "#143d8f" }}>RAPPORT ANNUEL D'ACTIVITE</h3>
                        </div>
                        <div className="selection-actions d-flex align-items-center justify-content-end">
                            {/* Date début */}
                            <div className="d-flex flex-column mt-1 mx-2">
                                <Calendar
                                    value={dates}
                                    onChange={(e) => setDates(e.value)}
                                    selectionMode="range"
                                    readOnlyInput
                                    placeholder="01/--/--- au 31/--/--"
                                    inputStyle={{ padding: "9px 0.75rem" }}
                                    showButtonBar
                                    dateFormat="dd/mm/yy"
                                    className="w-full md:w-14rem no-p"
                                    style={{ minWidth: 100 }}
                                />
                            </div>
                            <Button
                                className="mt-2 button-mobile d-flex align-items-center justify-content-end gap-5 "
                                size="small"
                                type="submit"
                                onClick={(e) => {
                                    handleGenerateFacture(e)

                                }}
                                data-pr-tooltip="Générer le PDF"  // Ajout du tooltip
                                tooltipOptions={{ position: 'top' }} // Options pour la position du tooltip
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" d="M17.924 7.154h-.514l.027-1.89a.46.46 0 0 0-.12-.298L12.901.134A.4.4 0 0 0 12.618 0h-9.24a.8.8 0 0 0-.787.784v6.37h-.515c-.285 0-.56.118-.76.328A1.14 1.14 0 0 0 1 8.275v5.83c0 .618.482 1.12 1.076 1.12h.515v3.99A.8.8 0 0 0 3.38 20h13.278c.415 0 .78-.352.78-.784v-3.99h.487c.594 0 1.076-.503 1.076-1.122v-5.83c0-.296-.113-.582-.315-.792a1.05 1.05 0 0 0-.76-.328M3.95 1.378h6.956v4.577a.4.4 0 0 0 .11.277a.37.37 0 0 0 .267.115h4.759v.807H3.95zm0 17.244v-3.397h12.092v3.397zM12.291 1.52l.385.434l2.58 2.853l.143.173h-2.637q-.3 0-.378-.1q-.08-.098-.093-.313zM3 14.232v-6h1.918q1.09 0 1.42.09q.51.135.853.588q.343.451.343 1.168q0 .552-.198.93q-.198.375-.503.59a1.7 1.7 0 0 1-.62.285q-.428.086-1.239.086h-.779v2.263zm1.195-4.985v1.703h.654q.707 0 .945-.094a.79.79 0 0 0 .508-.762a.78.78 0 0 0-.19-.54a.82.82 0 0 0-.48-.266q-.213-.04-.86-.04zm4.04-1.015h2.184q.739 0 1.127.115q.52.155.892.552q.371.398.565.972q.195.576.194 1.418q0 .741-.182 1.277q-.223.655-.634 1.06q-.31.308-.84.48q-.395.126-1.057.126H8.235zM9.43 9.247v3.974h.892q.501 0 .723-.057q.291-.074.482-.25q.193-.176.313-.579q.121-.403.121-1.099t-.12-1.068a1.4 1.4 0 0 0-.34-.581a1.13 1.13 0 0 0-.553-.283q-.25-.057-.98-.057zm4.513 4.985v-6H18v1.015h-2.862v1.42h2.47v1.015h-2.47v2.55z" /></svg>

                            </Button>
                        </div>
                        <div className="row d-flex bg-light"
                            style={{ overflow: "auto" }}>
                            <h5 style={{ color: "#143d8f" }}>DATE DU RAPPORT  10 juin 2024 Au 10 Décembre</h5>
                            <div className="ms-0">
                                <table
                                    className="table ms-0 w-s100  col-12"
                                    style={{ border: "4px solid #fb8c8c" }}>

                                    <tr>
                                        <td className=" font-bold "
                                            style={{ border: "2px ms-0 solid #fb8c8c" }}>INDICATEUR</td>
                                        <td className=" font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>N</td>
                                        <td className="font-bold "
                                            style={{ border: "2px solid #fb8c8c w-100" }}>N-1</td>


                                    </tr>

                                    <tr>
                                        <td className="p-md-1 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Nombre de membres au cours de la période</td>
                                        <td className="p-md-1 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>{Totalmembresmicrofinance ? Totalmembresmicrofinance : "-"}</td>
                                        <td className="p-md-1 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>-</td>


                                    </tr>
                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Femmes</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>{Femmessmembresmicrofinance ? Femmessmembresmicrofinance : "-"}
                                        </td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>-</td>


                                    </tr>
                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Hommes</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>{Hommesmembresmicrofinance ? Hommesmembresmicrofinance : "-"}</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>-</td>


                                    </tr>
                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Autres(Personnes morales,associations,…) à préciser :</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>-</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>-</td>


                                    </tr>

                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>Nombre de membres ayant cotisé au cours de la période</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>{Totaldescotisation ? Totaldescotisation : "-"}</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>


                                    </tr>
                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>Femmes</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>{nbFemmesayantcotise ? nbFemmesayantcotise : "-"}</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>


                                    </tr>
                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Hommes</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", backgroundColor: "#f7f7f7ff" }}>
                                            {nbHommesayantcotise ? nbHommesayantcotise : "-"}</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", backgroundColor: "#ffffffff" }}>-</td>

                                    </tr>
                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Autres(Personnes morales,associations,…) à préciser :</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>- </td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>- </td>

                                    </tr>

                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Montant des cotisations des membres au cours de la période</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>{totalCotisationAnticipe ? Number(totalCotisationAnticipe).toLocaleString("fr-FR", {
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 2,
                                            }) + " FBU" : "-"}</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>

                                    </tr>
                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Hommes</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>{totalCotisationFemmes ? Number(totalCotisationFemmes).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " FBU" : "-"}</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>- </td>

                                    </tr>
                                    {/* backgroundColor: "#ffffffff" */}
                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Femmes</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>{totalCotisationHommes ? Number(totalCotisationHommes).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " FBU" : "-"}</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>

                                    </tr>
                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Autres(Personnes morales,associations,…) à préciser :</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>

                                    </tr>
                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Nombre des membres bénéfiaires des crédits au cours de la période</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>{nombreBeneficiaires ? nombreBeneficiaires : "-"}</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>

                                    </tr>
                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Hommes</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>{LeshommesBeneficiareducredits ? LeshommesBeneficiareducredits : "-"}</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>

                                    </tr>
                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Femmes</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>{LesFemmesBeneficiareducredits ? LesFemmesBeneficiareducredits : "-"}</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>

                                    </tr>
                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Autres(Personnes morales,associations,…) à préciser :</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>

                                    </tr>
                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Montant des crédits octroyés aux membres au cours de la période</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>{MontantTotalAccordeAucoursdelaperiode ? Number(MontantTotalAccordeAucoursdelaperiode).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " FBU" : "-"}</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>

                                    </tr>
                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Hommes</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>{totalMontantHommesCredits ? Number(totalMontantHommesCredits).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " FBU" : "-"}</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>

                                    </tr>
                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Femmes</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>{totalMontantFemmesCredits ? Number(totalMontantFemmesCredits).toLocaleString("fr-FR", { minimumFractionDigits: 0, maximumFractionDigits: 2 }) + " FBU" : "-"}</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>

                                    </tr>
                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Autres(Personnes morales,associations,…) à préciser :</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>

                                    </tr>

                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Nombre des crédits sains</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>{nombresCreditsucoursdelaperiode ? (nombresCreditsucoursdelaperiode.toLocaleString("fr-FR", {
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 2
                                            })) : "-"}</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>

                                    </tr>
                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Hommes</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>{nombreCreditsSainsHommes ? nombreCreditsSainsHommes : "-"}</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>

                                    </tr>




                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Femmes</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>{nombreCreditsSainsFemmes ? nombreCreditsSainsFemmes : "-"}</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>

                                    </tr>
                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Autres(Personnes morales,associations,…) à préciser :</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>

                                    </tr>

                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Montant des crédits sains</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>{MontantTotalAccordeAucoursdelaperiode ? (MontantTotalAccordeAucoursdelaperiode.toLocaleString("fr-FR", {
                                                minimumFractionDigits: 0, maximumFractionDigits: 1
                                            })) + " FBU" : "-"}</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>

                                    </tr>
                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Hommes</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>{montantTotalSainsHommes ? (montantTotalSainsHommes.toLocaleString("fr-FR", {
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 2
                                            })) + " FBU" : "-"}</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>

                                    </tr>
                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Femmes</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>{montantTotalSainsFemmes ? (montantTotalSainsFemmes.toLocaleString("fr-FR", {
                                                minimumFractionDigits: 0,
                                                maximumFractionDigits: 2
                                            })) + " FBU" : "-"}</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>

                                    </tr>

                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Autres(Personnes morales,associations,…) à préciser :</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>

                                    </tr>
                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Nombre des crédits en souffrance au cours de la période</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>

                                    </tr>
                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Hommes</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>

                                    </tr>
                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Femmes</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>

                                    </tr>
                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Autres(Personnes morales,associations,…) à préciser :</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>-</td>

                                    </tr>
                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Montant des crédits en souffrance au cours de la période</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>

                                    </tr>
                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Hommes</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>

                                    </tr>
                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Femmes</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>

                                    </tr>
                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Autres(Personnes morales,associations,…) à préciser :</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>

                                    </tr>
                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Tarification des opérations avec les membres</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>
                                    </tr>
                                    <tr>
                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c" }}>Taux d'interet débiteur appliqué sur les crédits accordés aux membres</td>
                                        <td className="p-md-2 font-bold" style={{ border: "2px solid #fb8c8c" }}>
                                            {TypesCredits && TypesCredits.length > 0
                                                ? TypesCredits.map((type, index) => (
                                                    <div key={index}>
                                                        {type.nom} : {type.interet}%
                                                    </div>
                                                ))
                                                : "-"}
                                        </td>

                                        <td className="p-md-2 font-bold "
                                            style={{ border: "2px solid #fb8c8c", }}>-</td>

                                    </tr>
                                </table>
                            </div>
                        </div>
                        <div className="d-flex flex-column">
                            {!isVisible && (
                                <button
                                    onClick={handleToggle}
                                    style={{ backgroundColor: "#143d8f", marginBottom: "10px" }}
                                    className="btn btn-secondary btn-md"
                                >
                                    {isVisible ? "Afficher les éléments" : "Conserve le bilan"}
                                </button>
                            )}

                            {isVisible && (
                                <div className="form-contaianer mt-5">
                                    <div className="d-flex flex-row">
                                        <div className="row w-100">

                                            <div className="col-md-4">
                                                <div className="row">
                                                    <div className="col-md-2">
                                                        <label htmlFor="TYPE" className="label mt-2 font-bold ">Type</label>
                                                    </div>
                                                    <div className="col-md-10">
                                                        <Dropdown
                                                            value={data.TYPE}
                                                            options={type}
                                                            onChange={(e) => setValue("TYPE", e.value)}
                                                            optionLabel="name"
                                                            id="TYPE"
                                                            filter
                                                            placeholder="Sélectionner le type du bilan"
                                                            className={`w-100 ${hasError("TYPE") ? "p-invalid" : ""}`}
                                                            showClear
                                                        />
                                                        <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
                                                            {hasError("TYPE") ? getError("TYPE") : ""}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="row">
                                                    <div className="col-md-2">
                                                        <label htmlFor="PERIODE" className="label mb-1 font-bold mt-2">Periode</label>
                                                    </div>
                                                    <div className="col-md-10">
                                                        <Dropdown
                                                            value={data.PERIODE}
                                                            options={period}
                                                            onChange={(e) => setValue("PERIODE", e.value)}
                                                            optionLabel="name"
                                                            id="PERIODE"
                                                            filter
                                                            placeholder="Sélectionner la periode du bilan"
                                                            className={`w-100 ${hasError("PERIODE") ? "p-invalid" : ""}`}
                                                            showClear
                                                        />
                                                        <div className="invalid-feedback" style={{ minHeight: 21, display: "block" }}>
                                                            {hasError("PERIODE") ? getError("PERIODE") : ""}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="col-md-4">
                                                <div className="row">
                                                    <div className="col-md-4">
                                                        {/* <label htmlFor="TYPE" className="label mb-1 font-bold">Type</label> */}
                                                    </div>
                                                    <div className="col-md-8">
                                                        <button
                                                            onClick={handleSubmit}
                                                            style={{ backgroundColor: "#143d8f", marginTop: "15px" }}
                                                            className="btn btn-primary btn-md"
                                                        >
                                                            Enregiste le bilan
                                                        </button>

                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>


                                </div>
                            )}
                        </div>

                    </div>
                </>
            )}

            <Outlet />
        </>
    );


}