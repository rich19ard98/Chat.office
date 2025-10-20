import { useCallback, useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
// import { ConfirmDialog } from "primereact/confirmdialog";
import moment from "moment";
import { Calendar } from "primereact/calendar";
import { useNavigate } from "react-router-dom";
import { setBreadCrumbItemsAction } from "../../store/actions/appActions";
import { userSelector } from "../../store/selectors/userSelector";
import { Link } from "react-router-dom";
import fetchApi from "../../helpers/fetchApi";
import Loading from "../../components/app/Loading";
import { Dropdown } from "primereact/dropdown";
import { encodeId } from "../../utils/IdEncryption";
import { confirmDialog, ConfirmDialog } from 'primereact/confirmdialog';
import { jsPDF } from "jspdf";
import "jspdf-autotable";
import entete from "../../../public/images/nodebu.png";
/**
 * Récupérer toutes les Comptes comptables
 * @date  15/04/2025
 * @param {express.Request} req 
 * @param {express.Response} res 
 * @author rosine <gahimbarerosine9@gmail.com>
 */
export default function Journal_comptable_liste_page() {
    const [loading, setLoading] = useState(true);
    const [globalLoading, setGlobalLoading] = useState(false);
    const [ecritures, setEcritures] = useState([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [utilisateurdata, setutilisateurdata] = useState([]);
    const [membredata, setmembredata] = useState([]);
    const [comptedebitdata, setcomptedebitdata] = useState([]);
    const [comptecreditdata, setcomptecreditdata] = useState([]);
    const [operationdata, setoperationdata] = useState([]);
    const user = useSelector(userSelector);
    const [pdfUrl, setPdfUrl] = useState(null);
    const [profiledata, setProfiledata] = useState([])
    const [selectAll, setSelectAll] = useState(false);
    const [selectedItems, setSelectedItems] = useState(null);
    const [selectedUtilisateur, setSelectedUtilisateur] = useState(null);
    const [selectedMembre, setSelectedMembre] = useState(null);
    const [selectedcomptedebit, setSelectedcomptedebit] = useState(null);
    const [selectedcomptecredit, setSelectedcomptecredit] = useState(null);
    const [Selectedoperation, setSelecteoperation] = useState(null);
    const [montantTotal, setMontantTotal] = useState(0);
    const [montantTotalDebit, setMontantTotalDebit] = useState(0);
    const [montantTotalCredit, setMontantTotalCredit] = useState(0);
    const [startDate, setStartDate] = useState(null);
    const [endDate, setEndDate] = useState(null);

    const [dates, setDates] = useState(null);
    const [lazyState, setLazyState] = useState({
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
    const dispacth = useDispatch();
    const navigate = useNavigate();
    const calculateTotals = useCallback(() => {
        if (ecritures.length > 0) {

            const filteredEcritures = Selectedoperation?.name
                ? ecritures.filter((e) => e.TYPE_OPERATION === Selectedoperation.name)
                : ecritures;


            const totalDebit = filteredEcritures.reduce(
                (sum, item) => sum + (parseFloat(item.MONTANT) || 0),
                0
            );

            const totalCredit = filteredEcritures.reduce(
                (sum, item) => sum + (parseFloat(item.MONTANT) || 0),
                0
            );


            setMontantTotalDebit(totalDebit);
            setMontantTotalCredit(totalCredit);
        } else {

            setMontantTotalDebit(0);
            setMontantTotalCredit(0);
        }
    }, [Selectedoperation?.name, ecritures]);


    useEffect(() => {
        calculateTotals();
    }, [calculateTotals]);

    const onSelectionChange = (event) => {
        const value = event.value;
        setSelectedItems(value);
        setSelectAll(value.length === totalRecords);
    };

    const onSelectAllChange = (event) => {
        const selectAll = event.checked;

        if (selectAll) {
            setSelectAll(true);
            setSelectedItems(ecritures);
        } else {
            setSelectAll(false);
            setSelectedItems([]);
        }
    };

    const utilisateursSelected = (utilisateur) => {
        setSelectedUtilisateur(utilisateur);
    };
    const membresSelected = (membre) => {
        setSelectedMembre(membre);
    };

    const operationSelected = (operation) => {
        setSelecteoperation(operation);
    };


    const fetchUtilisateurs = useCallback(async () => {
        try {
            var url = `/administration/utilisateurs/fetch?`
            const res = await fetchApi(url);
            setutilisateurdata(
                res.result.data.map((util) => {
                    return {
                        name: `${util.NOM} ${util.PRENOM}`,
                        code: util.ID_UTILISATEUR
                    };
                })
            );
        } catch (error) {
            console.log(error);
        }
    }, []);
    useEffect(() => {
        fetchUtilisateurs();
    }, []);
    const fetchmembres = useCallback(async () => {
        try {
            var url = `/administration/utilisateurs/fetch?rows=10000&`
            if (profiledata) {
                url += `profil=2`;
            }
            const res = await fetchApi(url);
            // console.log(res);

            setmembredata(
                res.result.data.map((util) => {
                    return {
                        name: `${util.NOM} ${util.PRENOM}`,
                        code: util.ID_UTILISATEUR,
                    };
                })
            );
        } catch (error) {
            console.log(error);
        }
    }, []);


    useEffect(() => {
        fetchmembres();
    }, []);
    const fetchcomptecredit = useCallback(async () => {
        try {
            var url = `/plancomptable/comptescomptables/fetch?rows=10000&`
            const res = await fetchApi(url);


            setcomptecreditdata(
                res.result.data.map((util) => {
                    return {
                        name: util.NOM,
                        code: util.ID_COMPTES_COMPTABLES,
                    };
                })
            );
        } catch (error) {
            console.log(error);
        }
    }, []);
    useEffect(() => {
        fetchcomptecredit();
    }, []);
    const fetchcopmtedebit = useCallback(async () => {
        try {
            var url = `/plancomptable/comptescomptables/fetch?`
            const res = await fetchApi(url);

            setcomptedebitdata(
                res.result.data.map((util) => {
                    return {
                        name: util.NOM,
                        code: util.ID_COMPTES_COMPTABLES,
                    };
                })
            );
        } catch (error) {
            console.log(error);
        }
    }, []);
    useEffect(() => {
        fetchcopmtedebit();
    }, []);

    const fetchtypeoperation = useCallback(async () => {
        try {
            var url = `/cotisation/types_operations_comptables/fetchtypeoperation?rows=1000000&`
            const res = await fetchApi(url);
            setoperationdata(
                res.result.data.map((util) => {
                    return {
                        name: util.NOM_OPERATION,
                        code: util.ID_TYPES_OPERATIONS,
                    };
                })
            );
        } catch (error) {
            console.log(error);
        }
    }, []);
    useEffect(() => {
        fetchtypeoperation();
    }, []);
    const fetchEcritures = useCallback(async () => {
        try {
            setLoading(true);
            let url = `/plancomptable/ecriturecomptable/fetch?rows=10000000000&`;

            for (let key in lazyState) {
                const value = lazyState[key];
                if (value !== null && value !== undefined) {
                    url += `${key}=${encodeURIComponent(typeof value === "object" ? JSON.stringify(value) : value)}&`;
                }
            }

            if (dates) {
                const [startDate, endDate] = dates;
                if (startDate) {
                    url += `startDate=${startDate.toISOString()}&`;
                }
                if (endDate) {
                    url += `endDate=${endDate.toISOString()}&`;
                }
            }


            if (selectedUtilisateur?.code) {
                url += `utilisateurs=${selectedUtilisateur.code}&`;
            }
            if (selectedMembre?.code) {
                url += `membres_microfinance=${selectedMembre.code}&`;
            }
            if (Selectedoperation?.name) {
                url += `TYPE_OPERATION=${Selectedoperation.name}&`;
            }
            if (selectedcomptedebit) {
                url += `compte_debit=${selectedcomptedebit.code}&`;
            }
            if (selectedcomptecredit) {
                url += `compte_credit=${selectedcomptecredit.code}&`;
            }

            const res = await fetchApi(url);
            const allEcritures = res.result.data;
            const totalMontant = allEcritures.reduce((total, item) => total + (parseFloat(item.MONTANT) || 0), 0);


            let filteredEcritures = allEcritures;
            if (startDate && endDate) {
                const start = moment(startDate).startOf("day");
                const end = moment(endDate).endOf("day");
                filteredEcritures = allEcritures.filter((ecriture) => {
                    const operationDate = moment(ecriture.DATE_OPERATION);
                    return operationDate.isBetween(start, end, null, "[]");
                });
            }

            setEcritures(filteredEcritures);
            setTotalRecords(res.result.totalRecords);
            setMontantTotal(totalMontant);


        } catch (error) {
            console.error("Erreur lors du chargement des écritures comptables :", error);
        } finally {
            setLoading(false);
        }
    }, [
        lazyState,
        selectedUtilisateur,
        selectedMembre,
        Selectedoperation,
        selectedcomptecredit,
        selectedcomptedebit,
        startDate,
        endDate,
        dates

    ]);


    useEffect(() => {
        fetchEcritures();
    }, [lazyState.first,
    lazyState.rows,
        selectedUtilisateur,
        selectedMembre,
        Selectedoperation,
        selectedcomptecredit,
        selectedcomptedebit,
        startDate,
        endDate, dates]);
    useEffect(() => {
        setLazyState((s) => ({ ...s, first: 0 }));
    }, [
        selectedUtilisateur,
        selectedMembre,
        Selectedoperation,
        selectedcomptedebit,
        selectedcomptecredit,
        startDate,
        endDate, dates]);
        
        useEffect(() => {
            document.title = "Liste des journaux"
            dispacth(setBreadCrumbItemsAction([
                {
                    path: "journal",
                    name: "journal",
                },
            ]));
        
            return () => {
              dispacth(setBreadCrumbItemsAction([]));
          };
        }, [])

    const onPage = (event) => setLazyState(event);
    const onSort = (event) => setLazyState(event);
    const onFilter = (event) => {
        event.first = 0;
        setLazyState(event);
    };
    const totalDebit = ecritures
        .filter(commde => commde && commde.COMPTE_DEBIT) // Filtrer les recettes avec TYPE_BENEFE == 2
        .reduce((total, commde) => {
            if (commde && commde.MONTANT) {
                return total + parseFloat(commde.MONTANT); // Somme des MONTANT_A_PAYER
            }
            return total;
        }, 0);
    const totalCredit = ecritures
        .filter(commde => commde && commde.COMPTE_CREDIT) // Filtrer les recettes avec TYPE_BENEFE == 2
        .reduce((total, commde) => {
            if (commde && commde.MONTANT) {
                return total + parseFloat(commde.MONTANT); // Somme des MONTANT_A_PAYER
            }
            return total;
        }, 0);
    const exportPdf = () => {
        const pageWidth = 210;
        const pageHeight = 297;
        const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: 'a4' });


        // Ajouter l'image importée
        doc.addImage(entete, "JPEG", 0, 2, 70, 30);

        // Titre sous l'image
        doc.setFontSize(13);
        doc.setFont("helvetica", "bold");
        const numeroVente = ecritures.ID_ECRITURES_COMPTABLES;
        doc.text(`Journal comptable du le : ${moment(Date()).format("DD/MM/YYYY")}`, 100, 40, { align: "center" });

        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");

        const columns = [
            { title: "#", dataKey: "NUMERO" },
            { title: "Date operation", dataKey: "DATE_OPERATION" },
            { title: "Libelle", dataKey: "LIBELLE" },
            { title: "Compte debit", dataKey: "COMPTE_DEBIT" },
            { title: "Compte credit", dataKey: "COMPTE_CREDIT" },
            { title: "Montant", dataKey: "MONTANT" },
            // { title: "Type d'operation", dataKey: "TYPE_OPERATION" },
            { title: "Caissier", dataKey: "CAISSIER" },
        ];

        // Génération du tableau PDF avec fusion de cellules et centrage
        // const montatTotal = modes.MONTANT_TOTAL ? parseFloat(modes.MONTANT_TOTAL) : 0;

        doc.autoTable({
            startY: 45,
            head: [columns.map(col => col.title)],
            body: [
                ...ecritures.map((item, index) => [
                    index + 1,

                    item.DATE_OPERATION ? moment(item.DATE_OPERATION).format("DD/MM/YYYY") : "-",
                    item?.LIBELLE ? item?.LIBELLE : "-",
                    item.comptedebit?.NOM ? item.comptedebit?.NOM : "-",
                    item.comptecredit?.NOM ? item.comptecredit?.NOM : "-",
                    item.MONTANT ? `${parseFloat(item.MONTANT).toLocaleString('fr-FR').replace(/\s/g, ' ')} Fbu` : "0 Fbu",
                    // item?.TYPE_OPERATION ? item?.TYPE_OPERATION : "-",
                    item.utilisateurs?.NOM ? item.utilisateurs?.NOM : "-",
                ]),
                // Ajouter les lignes pour les totaux
                // ["Total", "", `${montatTotal.toLocaleString('fr-FR').replace(/\s/g, ' ')} Fbu`,],
            ],
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

        // Définir la hauteur et la position du footer
        const footerYPosition = pageHeight - 20;

        // Ajouter une nouvelle page si le contenu dépasse la zone
        if (finalY + 20 > footerYPosition) {
            doc.addPage();
        }

        // Ajouter le footer sur la même ligne
        // const benef = ecritures.IS_BENEFICIAIRE == 1 ? (`${modes.empl.NOM} ${modes.empl.PRENOM}`) : (`${modes.fourn.NOM_COMPLET}`)

        const effectuéPar = `Effectué par : ${user?.NOM} ${user?.PRENOM}`;
        // const approuvéPar = `Approuvé par : ${ecritures.validateur.NOM} ${ecritures.validateur.PRENOM}`;

        // Positionnement du texte
        doc.setFontSize(11);
        doc.setFont("helvetica", "normal");
        // doc.text(`Bénéficiaire : ${benef}`, 10, footerYPosition - 30);
        doc.text(effectuéPar, 10, footerYPosition - 10);
        // doc.text(approuvéPar, 125, footerYPosition - 10,);

        // Ajouter l'image du pied de page
        // doc.addImage(piedFact, "JPEG", 0, footerYPosition + 5, pageWidth, 15);
  const totalY = doc.autoTable.previous.finalY + 10; // Positionner sous le tableau de charges
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text("Total Produit", 5, totalY);
    doc.text("Total Charges", 100, totalY);
   

    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`${totalDebit}`, 5, totalY + 10);
    doc.text(`${totalCredit}`, 100, totalY + 10);


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

    return (
        <>

            {/* <ConfirmDialog closable dismissableMask={true} /> */}
            {globalLoading && <Loading />}
            {pdfUrl ? (
                <>
                    <div className="mt-4">
                        <h1 className="mb-3">Dépense générée :</h1>
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
                    <div className="px-4 py-3 main_content">
                        <div className="d-flex align-items-center justify-content-between">
                            <h1 className="mb-3">Journal comptables</h1>
                            {/* <Button
                        label="ajouter compte"
                        icon="pi pi-plus"
                        size="small"
                        onClick={() => {
                            navigate("/comptecomptable/new");
                        }}
                    /> */}
                        </div>
                        <div className="d-flex align-items-center justify-content-between">
                            <h1 className="mb-3"></h1>

                        </div>
                        <div className="shadow my-2 bg-white p-3 rounded d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">
                                {/* Recherche */}
                                <div className="p-input-icon-left">
                                    <i className="pi pi-search" />
                                    <InputText
                                        type="search"
                                        placeholder="Recherche"
                                        className="p-inputtext-sm"
                                        style={{ minWidth: 300 }}
                                        onInput={(e) => setLazyState((s) => ({ ...s, search: e.target.value }))}
                                    />
                                </div>

                                {/* Dropdown Membre */}
                                <div className="d-flex flex-column mx-1">
                                    <Dropdown
                                        value={selectedUtilisateur}
                                        onChange={(e) => {
                                            utilisateursSelected(e.value);
                                        }}

                                        options={utilisateurdata}
                                        filter
                                        filterBy="name"
                                        optionLabel="name"
                                        placeholder="Caissier"
                                        className="w-full md:w-10rem mx-3 no-p"
                                        style={{ minWidth: 300 }}
                                        showClear
                                    />
                                </div>

                                {/* Dropdown membre */}
                                <div className="d-flex flex-column mx-1">
                                    <Dropdown
                                        value={selectedMembre}
                                        onChange={(e) => { membresSelected(e.value); }}
                                        options={membredata}
                                        filter
                                        filterBy="name"
                                        optionLabel="name"
                                        placeholder="Membre"
                                        style={{ minWidth: 300 }}
                                        className="w-full md:w-10rem mx-3 no-p"
                                        showClear
                                    />
                                </div>
                                {/* */}
                                <div className="d-flex flex-column mx-1">
                                    <Dropdown
                                        value={Selectedoperation}
                                        onChange={(e) => operationSelected(e.value)}
                                        options={operationdata}
                                        filter
                                        filterBy="name"
                                        style={{ minWidth: 300 }}
                                        optionLabel="name"
                                        placeholder="Type opération"
                                        className="w-full md:w-10rem mx-3 no-p"
                                        showClear
                                    />
                                </div>


                            </div>

                        </div>

                        <div className="shadow my-3 bg-white p-3 rounded d-flex align-items-center justify-content-between">
                            <div className="d-flex align-items-center">

                                <div className="d-flex flex-column mx-1">
                                    <label htmlFor="compteDebit" style={{ color: "black", fontSize: "0.700rem" }}>Montant Total Débit</label>
                                    <InputText
                                        id="compteDebit"
                                        value={montantTotalDebit.toLocaleString("fr-FR")}
                                        disabled
                                        className="p-inputtext-sm"
                                        style={{ color: "blue", fontWeight: "bold", minWidth: "400px" }}

                                    />
                                </div>


                                <div className="d-flex flex-column mx-1">
                                    <label htmlFor="compteCredit" style={{ color: "black", fontSize: "0.700rem" }}>Montant Total Crédit</label>
                                    <InputText
                                        id="compteCredit"
                                        value={montantTotalCredit.toLocaleString("fr-FR")}
                                        disabled
                                        className="p-inputtext-sm"
                                        style={{ color: "blue", fontWeight: "bold", minWidth: "400px" }}
                                    />
                                </div>
                                {/* */}
                                <div className="d-flex flex-column mx-1">
                                    <label htmlFor="startDate" style={{ color: "black", fontSize: "0.700rem" }}>Date</label>
                                    <Calendar
                                        value={dates}
                                        onChange={(e) => setDates(e.value)}
                                        selectionMode="range"
                                        readOnlyInput
                                        placeholder="Filtre par période"
                                        inputStyle={{ padding: "9px 0.75rem" }}
                                        showButtonBar
                                        todayButtonClassName="opacity-0"
                                        dateFormat="dd/mm/yy"
                                        inputClassName="cursor-pointer"
                                        className="w-full md:w-14rem no-p"
                                        maxDate={new Date()}
                                        style={{ minWidth: 400, marginTop: "0", marginBottom: "0" }}
                                    />
                                </div>


                            </div>
                              <div className="selection-actions d-flex align-items-center ml-3">
                <Button
                disabled={ecritures.length == 0}
              className=" mt-3 ml-3 button-mobile "
              size="small"
              type="submit"
              data-pr-tooltip="Genere le pdf" tooltip tooltipOptions={{ position: 'bottom' }}
              onClick={(e) => {
                handleGenerateFacture(e)

              }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20"><path fill="currentColor" d="M17.924 7.154h-.514l.027-1.89a.46.46 0 0 0-.12-.298L12.901.134A.4.4 0 0 0 12.618 0h-9.24a.8.8 0 0 0-.787.784v6.37h-.515c-.285 0-.56.118-.76.328A1.14 1.14 0 0 0 1 8.275v5.83c0 .618.482 1.12 1.076 1.12h.515v3.99A.8.8 0 0 0 3.38 20h13.278c.415 0 .78-.352.78-.784v-3.99h.487c.594 0 1.076-.503 1.076-1.122v-5.83c0-.296-.113-.582-.315-.792a1.05 1.05 0 0 0-.76-.328M3.95 1.378h6.956v4.577a.4.4 0 0 0 .11.277a.37.37 0 0 0 .267.115h4.759v.807H3.95zm0 17.244v-3.397h12.092v3.397zM12.291 1.52l.385.434l2.58 2.853l.143.173h-2.637q-.3 0-.378-.1q-.08-.098-.093-.313zM3 14.232v-6h1.918q1.09 0 1.42.09q.51.135.853.588q.343.451.343 1.168q0 .552-.198.93q-.198.375-.503.59a1.7 1.7 0 0 1-.62.285q-.428.086-1.239.086h-.779v2.263zm1.195-4.985v1.703h.654q.707 0 .945-.094a.79.79 0 0 0 .508-.762a.78.78 0 0 0-.19-.54a.82.82 0 0 0-.48-.266q-.213-.04-.86-.04zm4.04-1.015h2.184q.739 0 1.127.115q.52.155.892.552q.371.398.565.972q.195.576.194 1.418q0 .741-.182 1.277q-.223.655-.634 1.06q-.31.308-.84.48q-.395.126-1.057.126H8.235zM9.43 9.247v3.974h.892q.501 0 .723-.057q.291-.074.482-.25q.193-.176.313-.579q.121-.403.121-1.099t-.12-1.068a1.4 1.4 0 0 0-.34-.581a1.13 1.13 0 0 0-.553-.283q-.25-.057-.98-.057zm4.513 4.985v-6H18v1.015h-2.862v1.42h2.47v1.015h-2.47v2.55z"/></svg>
            
            </Button>
              </div>


                            {/* Date début */}
                            <div className="d-flex flex-column mx-0">

                            </div>


                        </div>

                        <div className="content">
                            <div className="shadow rounded mt-3 pr-1 bg-white">
                                <DataTable
                                    lazy
                                    value={ecritures}
                                    size="small"
                                    paginator
                                    rowsPerPageOptions={[5, 10, 25, 50, 100, 500, 1000, 1500, 2000, 2500, 3000, 3500, 4000]}
                                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                                    currentPageReportTemplate={`{first} à {last} sur ${totalRecords} écritures`}
                                    emptyMessage="Aucune écriture trouvée"
                                    first={lazyState.first}
                                    rows={lazyState.rows}
                                    totalRecords={totalRecords}
                                    onPage={onPage}
                                    onSort={onSort}
                                    onFilter={onFilter}
                                    selection={selectedItems}
                                    onSelectionChange={onSelectionChange}
                                    onSelectAllChange={onSelectAllChange}
                                    sortField={lazyState.sortField}
                                    sortOrder={lazyState.sortOrder}
                                    filters={lazyState.filters}
                                    loading={loading}
                                    scrollable
                                    tableStyle={{ minWidth: "60rem" }}
                                >



                                    <Column
                                        field="DATE_OPERATION"
                                        header="Date d'opération"
                                        sortable
                                        body={(item) => moment(item.DATE_OPERATION).format("DD/MM/YYYY")}
                                    />
                                    <Column
                                        field="LIBELLE"
                                        header="Libellé"
                                        sortable
                                    />
                                    <Column
                                        field="COMPTE_DEBIT"
                                        header="Compte Débit"
                                        sortable
                                        body={(item) => {
                                            return (
                                                <span>
                                                    {item?.comptedebit?.CODE}-{item.comptedebit?.NOM}
                                                </span>
                                            );
                                        }}
                                    />
                                    <Column
                                        field="COMPTE_CREDIT"
                                        header="Compte Crédit"
                                        sortable
                                        body={(item) => {
                                            return (
                                                <span>
                                                    {item?.comptecredit?.CODE}-{item.comptecredit?.NOM}
                                                </span>
                                            );
                                        }}
                                    />
                                    <Column
                                        field="MONTANT"
                                        header="Montant"
                                        sortable
                                        body={(item) => `${parseFloat(item.MONTANT).toLocaleString('fr-FR')} Fbu`}
                                    />
                                    <Column
                                        field="TYPE_OPERATION"
                                        header="Type d'opération"
                                        sortable
                                    />
                                    <Column
                                        field="IMAGE"
                                        header="Caissier"
                                        frozen
                                        sortable
                                        body={(item) => {
                                            const css = `
                                .round-indicator .p-image-preview-indicator {
                                    border-radius: 50%;
                                }`;
                                            return (
                                                <>

                                                    {item?.utilisateurs ?
                                                        <Link

                                                            className=" text-decoration-none d-flex round-indicator"
                                                            style={{ color: '#399af2' }}
                                                            to={`/utilisateurs/${encodeId(item?.utilisateurs?.UTILISATEUR_ID)}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                            }}
                                                            data-pr-position="bottom"
                                                        >

                                                            <div className="d-flex round-indicator">

                                                                {item?.utilisateur ? (
                                                                    <Image
                                                                        src={item?.utilisateurs?.IMAGE}
                                                                        alt="Image"
                                                                        className="rounded-5"
                                                                        imageClassName="rounded-5 object-fit-cover"
                                                                        imageStyle={{ width: "30px", height: "30px" }}
                                                                        style={{ width: "30px", height: "30px" }}
                                                                        preview
                                                                    />
                                                                ) : (
                                                                    <div style={{
                                                                        width: '30px', height: '30px',
                                                                        borderRadius: '50%', backgroundColor: '#ccc', display: 'flex',
                                                                        justifyContent: 'center', alignItems: 'center', color: 'black', fontWeight: 'bold'
                                                                    }}>
                                                                        {item?.utilisateurs?.NOM.charAt(0)}{item?.utilisateurs?.PRENOM.charAt(0)}
                                                                    </div>
                                                                )}
                                                                <div className="ml-2">
                                                                    <div className="font-bold text-sm">
                                                                        {item?.utilisateurs?.NOM} {item?.utilisateurs?.PRENOM}
                                                                    </div>
                                                                </div>
                                                            </div>


                                                        </Link>
                                                        : '-'}
                                                    <style>{css}</style>
                                                </>
                                            );
                                        }}
                                    />

                                </DataTable>
                                {/* <div className="content">
                                    <div className="d-flex align-items-center justify-content-between">
                                        <h1 className="mb-3">Totaux du journal</h1>

                                    </div>
                                    <div className="shadow rounded mt-3 pr-1 bg-white">
                                        <table className="w-100 d-fklex justify-content-center">

                                            <tr>
                                                <td>Total debit</td>
                                                <td>Total credit</td>
                                                <td>Total solde</td>
                                            </tr>
                                            <tr>
                                                <td>{parseInt(totalDebit)}</td>
                                                <td>{parseInt(totalCredit)}</td>

                                            </tr>

                                        </table>



                                    </div>
                                </div> */}
                                 <div className="content">
  <div className="d-flex align-items-center justify-content-between">
    <h1 className="mb-3">Total mouvement sur compte</h1>
  </div>
  <div className="shadow rounded mt-3 pr-1 bg-white">
    <DataTable
      value={[totalDebit]} // Pas de données à afficher ici
      tableStyle={{ minWidth: "50rem" }}
      className="w-100"
      showGridlines
    >
      <Column field="TotalDebit" header="Total Débit" body={() => `${totalDebit.toLocaleString('fr-FR')} Fbu`} />
      <Column field="TotalCredit" header="Total Crédit" body={() => `${totalCredit.toLocaleString('fr-FR')} Fbu`} />
      
    </DataTable>
  </div>
</div> 
                            </div>
                        </div>
                    </div>
                
                </>
            )}

        </>
    );
}
