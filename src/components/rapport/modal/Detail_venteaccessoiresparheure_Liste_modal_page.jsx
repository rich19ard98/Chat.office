import React, { useCallback, useEffect, useRef, useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { setBreadCrumbItemsAction } from "../../../store/actions/appActions";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Dropdown } from "primereact/dropdown";
import { DataTable } from "primereact/datatable";
import { Column } from "primereact/column";
import moment from "moment";
import fetchApi from "../../../helpers/fetchApi";
import Loading from "../../../components/app/Loading";
import { userSelector } from "../../../store/selectors/userSelector";
export default function Detail_venteaccessoiresparheure_Liste_modal_page({ dates, datespardates, heure, statuts, dateSelected }) {
    const [isVisible, setIsVisible] = useState(false);
    const [loading, setLoading] = useState(true);
    const [totalRecords, setTotalRecords] = useState(0);
    const [cmdClient, setCmdClient] = useState([]);
    const [selectedItems, setSelectedItems] = useState(null);
    const [refvente, setRefvente] = useState([]);
    const [referencedata, setReferencedata] = useState(null);
    const user = useSelector(userSelector);
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [lazyState, setLazyState] = useState({
        first: 0,
        rows: 10,
        page: 1,
        sortField: null,
        sortOrder: null,
        search: "",
        filters: {
            name: { value: "", matchMode: "contains" },
        },
    });
    // Fetch user sales reference numbers
    const fetchReferenceNumero = useCallback(async () => {
        try {
            const url = `/ventes/vente/fetch?idUser=${user.ID_UTILISATEUR}&rows=1000000`;
            const res = await fetchApi(url);
            setRefvente(res.result.data.map(util => ({
                name: util.NUMERO_VENTE,
                code: util.ID_VENTE,
            })));
        } catch (error) {
            console.error(error);
        }
    }, [user.ID_UTILISATEUR]);

    // Fetch detailed sales data
    const fetchStockMp = useCallback(async () => {
        setLoading(true);
        try {
            const datestring = dates ? dates.toString() : new Date().toString();
            const url = `/ventes/vente/fetchDetailvente?userId=${user.ID_UTILISATEUR}&startDate=${datestring}&endDate=${datestring}`;

            // Add lazy state filters to URL
            Object.entries(lazyState).forEach(([key, value]) => {
                if (value) {
                    if (typeof value === "object") {
                        url += `&${key}=${JSON.stringify(value)}`;
                    } else {
                        url += `&${key}=${value}`;
                    }
                }
            });
            if (referencedata) {
                url += `&isreferencedata=${referencedata.code}`;
            }

            const res = await fetchApi(url);
            setCmdClient(res.result.data);
            setTotalRecords(res.result.totalRecords);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    }, [dates, lazyState, referencedata, user.ID_UTILISATEUR]);

    useEffect(() => {
        document.title = "Détail vente";
        dispatch(setBreadCrumbItemsAction([{ path: 'ventDetail', name: 'Détail vente' }]));
        fetchReferenceNumero();
        fetchStockMp();
        return () => {
            dispatch(setBreadCrumbItemsAction([]));
        };
    }, [dispatch, fetchReferenceNumero, fetchStockMp]);

    const totalValue = cmdClient.reduce((total, cmd) => {
        if (cmd && cmd.QUANTITE && cmd.PRIX_UNIT_HTVA) {
            return total + parseFloat(cmd.QUANTITE) * parseFloat(cmd.PRIX_UNIT_HTVA);
        }
        return total;
    }, 0);

    const formattedTotal = totalValue.toLocaleString('fr');

    const totalValueAchat = cmdClient.reduce((total, cmd) => {
        if (cmd && cmd.QUANTITE && cmd.PRIX_ACHAT) {

            return total + parseFloat(cmd.QUANTITE) * parseFloat(cmd.PRIX_ACHAT);
        }
        return total;
    }, 0);

    const formattedTotalAchat = totalValueAchat.toLocaleString('fr');

    return (
        <>
            {loading && <Loading />}
            <div className="shadow my-2 bg-white p-3 rounded">
                <div className="d-flex align-items-center justify-content-between mb-3">
                    <h3>Détail de la vente des médicaments</h3>
                    <InputText
                        type="search"
                        placeholder="Recherche"
                        className="p-inputtext-sm"
                        style={{ minWidth: 300 }}
                        onInput={(e) => setLazyState((prevState) => ({ ...prevState, search: e.target.value }))}
                    />
                    <Dropdown
                        value={referencedata}
                        onChange={(e) => setReferencedata(e.value)}
                        options={refvente}
                        filter
                        optionLabel="name"
                        placeholder="Référence vente"
                        className="w-full md:w-15rem mx-2"
                        showClear
                    />
                </div>

                <div className="d-flex justify-content-between text-muted mb-3">
                    <div>
                        <strong>M.T.A</strong>: <span style={{ color: 'blue' }}>{formattedTotalAchat} FBU</span>
                    </div>
                    <div>
                        <strong>M.T.V</strong>: <span style={{ color: 'blue' }}>{formattedTotal} FBU</span>
                    </div>
                </div>

                <DataTable
                    lazy
                    value={cmdClient}
                    paginator
                    rows={lazyState.rows}
                    totalRecords={totalRecords}
                    onPage={(event) => setLazyState((prevState) => ({ ...prevState, first: event.first, rows: event.rows }))}
                    globalFilter={lazyState.search}
                    loading={loading}
                    emptyMessage="Aucun élément trouvé"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
                    currentPageReportTemplate="Showing {first} to {last} of {totalRecords} entries"
                    className="datatable-custom"
                >
                    <Column field="Médicament" header="Médicament" sortable body={(item) => (
                        <div>
                            <strong>{item?.stockV?.medicaments?.NOM || '-'}</strong>
                        </div>
                    )} />
                    <Column field="QUANTITE" header="Quantité" body={(item) => (
                        <span>{item.QUANTITE ? parseFloat(item.QUANTITE).toLocaleString('fr') : '-'} {item?.stockV?.medicaments?.CONDITIONNEMENT}</span>
                    )} />
                    <Column field="PRIX_ACHAT" header="P.A.U" body={(item) => (
                        <span>{parseFloat(item.PRIX_ACHAT).toLocaleString('fr')} FBU</span>
                    )} />
                    <Column field="MONTANT_MINUTE" header="P.A.T" body={(item) => (
                        <span>{item.QUANTITE && item.PRIX_ACHAT ? (parseFloat(item.QUANTITE) * parseFloat(item.PRIX_ACHAT)).toLocaleString('fr') : '-'} FBU</span>
                    )} />
                    <Column field="PRIX_UNIT_HTVA" header="P.V.U" body={(item) => (
                        <span>{parseFloat(item.PRIX_UNIT_HTVA).toLocaleString('fr')} FBU</span>
                    )} />
                    <Column field="POURCENTAGE" header="Réduction" body={(item) => (
                        <span>{item.POURCENTAGE ? parseFloat(item.POURCENTAGE).toLocaleString('fr') : '-'} %</span>
                    )} />
                    <Column field="PRIX_UNIT_RED" header="P.V.U.R" body={(item) => (
                        <span>{item.PRIX_UNIT_RED ? parseFloat(item.PRIX_UNIT_RED).toLocaleString('fr') : '-'} FBU</span>
                    )} />

                    <Column field="MONTANT_MINUTE" header="P.V.T" body={(item) => (
                        <span>{item.QUANTITE && item.PRIX_UNIT_RED ? (parseFloat(item.QUANTITE) * parseFloat(item.PRIX_UNIT_RED)).toLocaleString('fr') : '-'} FBU</span>
                    )} />
                    <Column field="DATE_INSERTION" header="Date de vente" body={(item) => (
                        moment(item.DATE_INSERTION).format("DD/MM/YYYY HH:mm")
                    )} />
                </DataTable>
            </div>
            <Outlet />
        </>
    );
}