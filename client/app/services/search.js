import { axios } from "@/services/axios";

const Search = {
  query: params => axios.get("http://localhost:8000/api/v1/news/search/", { params }),
};

export default Search;
