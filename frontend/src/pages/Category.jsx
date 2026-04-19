import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
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

const Muted = styled.p`
  margin: 0;
  color: var(--muted);
  line-height: 1.5;
  a {
    color: var(--primary);
  }
`;

function Category() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState(null);

  useEffect(() => {
    api
      .get("/quiz/categories")
      .then(unwrap)
      .then((data) => setCategories(data.categories || []))
      .catch((e) => setErr(e.message))
      .finally(() => setLoading(false));
  }, []);

  const navigate = useNavigate();

  function handleSubmit(category) {
    navigate(`/quiz/play?category=${encodeURIComponent(category)}`);
  }

  return (
    <WrapperBox>
      <Title>Select a Category to start!</Title>
      {loading ? (
        <Muted>Loading categories…</Muted>
      ) : err ? (
        <div className="card error">{err}</div>
      ) : categories.length === 0 ? (
        <Muted>
          No categories returned. Active questions need a <strong>Category</strong> field. Add some in{" "}
          <Link to="/admin">Admin</Link>, or redeploy the backend so demo questions can seed on first run.
        </Muted>
      ) : (
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
      )}
    </WrapperBox>
  );
}

export default Category;
