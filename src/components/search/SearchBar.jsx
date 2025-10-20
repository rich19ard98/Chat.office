import { useEffect, useState } from "react";
import AppSearch from "./AppSearch";
import { Dialog } from "primereact/dialog";
import { InputText } from "primereact/inputtext";
import { Button } from "primereact/button";
import { useSelector } from "react-redux"

import { userSelector } from "../../store/selectors/userSelector";
import { is } from "date-fns/locale";
import PROFILS from "../../constants/PROFILS";

export default function SearchBar() {
    const [showSearch, setShowSearch] = useState(false)
    const [search, setSearch] = useState("")
    const user = useSelector(userSelector);
    const isMembre = user.ID_PROFIL
    const searchHeader = <>
        <div className="search-header d-flex -align-items-center justify-content-between mt-3">
            <div className="p-input-icon-left mr-2 b-2 mb-2 w-100">
                <i className="pi pi-search" />
                <InputText
                    type="search"
                    placeholder="Rechercher"
                    className="p-inputtext-sm w-100"
                    style={{ minWidth: 30 }}
                    onInput={(e) => {
                        setSearch(e.target.value)
                    }}
                    autoFocus
                />
            </div>
            <Button icon="pi pi-times" rounded text size="small" className="ml-2" onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                setShowSearch(false)
                setSearch("")
            }} />
        </div>
        <hr style={{ margin: "5px 0 0 0" }} />
    </>
    useEffect(() => {
        const ctrl1 = (e) => e.ctrlKey && e.key.toLowerCase() === "k";

        const handler = (e) => {
            if (ctrl1(e)) {
                setShowSearch(t => !t)
            }
        };

        const ignore = (e) => {
            if (ctrl1(e)) {
                e.preventDefault();
            }
        };

        window.addEventListener("keyup", handler);
        window.addEventListener("keydown", ignore);

        return () => {
            window.removeEventListener("keyup", handler);
            window.removeEventListener("keydown", ignore);
        };
    }, []);
    return (
        <>
            <Dialog visible={showSearch} onHide={() => setShowSearch(false)} position="center" header={searchHeader} headerClassName="py-0" className="mt-2 searchContent" contentStyle={{}} style={{ width: '75vw', maxWidth: 700, height: "80vh", maxHeight: 1000 }}>
                <AppSearch setShowSearch={setShowSearch} search={search} />
            </Dialog>
            {isMembre === PROFILS.MEMBRE ? null : (
                <div className="searchbar-container d-flex align-items-center justify-content-between rounded" onClick={e => {
                    e.preventDefault()
                    e.stopPropagation()
                    setShowSearch(true)
                }}>
                    <div className="d-flex align-items-center">
                        <span className="pi pi-search"></span>
                        <div className="search-label ml-3">Rechercher dans Banguka...</div>
                    </div>
                    <div className="search-command">CTRL+K</div>
                </div>)}
            {isMembre === PROFILS.MEMBRE ? null : (<Button size="small" severity="secondary" icon="pi pi-search" outlined style={{ color: "white", width: 40, height: 40, border: "none" }} rounded className="p-2 mr-2" id="mobileSearch" onClick={e => {
                e.preventDefault()
                e.stopPropagation()
                setShowSearch(true)
            }}
            />)}

        </>
    )
}