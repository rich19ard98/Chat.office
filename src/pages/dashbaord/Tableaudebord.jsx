import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { userSelector } from "../../store/selectors/userSelector";
import { useEffect, useRef, useState } from "react";
import { setBreadCrumbItemsAction } from "../../store/actions/appActions";

export default function Tableaudebord() {
    const dispatch = useDispatch();
    const user = useSelector(userSelector);
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        setLoading(true);
        // dispatch(setBreadCrumbItemsAction([
        //     { path: "dashbord", name: "Tableau de bord" }
        // ]));
        document.title = "Message";
        setLoading(false);
        return () => dispatch(setBreadCrumbItemsAction([]));
    }, [dispatch]);

    // ✅ Fonction qui redirige vers la page des messages
    const handleUserClick = () => {
        if (user?.ID_UTILISATEUR) {
            navigate(`/administration/messages/${user.ID_UTILISATEUR}`);
        }
    };

    return (
        <div className="dashboard-container">
         

         
        </div>
    );
}
