import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import Button from "../Ui/Button";
import { useEffect, useState } from "react";
import { api, unwrap } from "../api/api";

const WrapperBox = styled.div`
  max-width: 680px;
`;

const Title = styled.h2`
  margin-bottom: 8px;
`;

const Grid = styled.div`
  display: grid;
  gap: 12px;
  margin-top: 16px;
`;

function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    api
      .get("/quiz/categories")
      .then(unwrap)
      .then((data) => setCategories(data.categories))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  const navigate = useNavigate();

  function handleSubmit(category) {
    navigate(`/quiz/play?category=${category}`);
  }
  return (
    <WrapperBox>
      <Title>Select a Category to start!</Title>
      <Grid>
        {categories.map((category) => (
          <Button
            key={category}
            variation="primary"
            onClick={() => handleSubmit(category)}
          >
            {category}
          </Button>
        ))}
      </Grid>
    </WrapperBox>
  );
}

export default Category;
