
import "../../styles/app/search.scss"
import SearchNodebu from "./SearchNodebu";

export default function AppSearch({ setShowSearch, search }) {
          return (
                    <div className="search-container w-100">
                        <SearchNodebu search={search} setShowSearch={setShowSearch} />
                    </div>
          )
}