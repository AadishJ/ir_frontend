import React, { useState } from "react";
import {
  Box,
  Button,
  Container,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  IconButton,
  CircularProgress,
  Fade,
  ListItemButton,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";

const BACKEND_URL = "https://ir-backend-e4le.onrender.com/search";

interface DocResult {
  doc_id: number;
  filename: string;
  score: number;
  text: string;
}

function highlightText(text: string, terms: string[]) {
  if (!terms.length) return text;
  const pattern = new RegExp(
    `\\b(${terms
      .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|")})\\b`,
    "gi"
  );
  const parts = text.split(pattern);
  return (
    <>
      {parts.map((part, i) =>
        terms.some((t) => t.toLowerCase() === part.toLowerCase()) ? (
          <mark
            key={i}
            style={{
              background: "#ffe066",
              color: "#222",
              borderRadius: "3px",
              padding: "0 2px",
            }}
          >
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

const App: React.FC = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<DocResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<DocResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const handleSearch = async () => {
    if (!query.trim()) {
      setError("Please enter a query.");
      setResults([]);
      return;
    }
    setLoading(true);
    setError(null);
    setResults([]);
    setSelectedDoc(null);
    try {
      const res = await fetch(BACKEND_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });
      const data = await res.json();
      if (data.error) {
        setError(data.error);
        setResults([]);
      } else if (data.results.length === 0) {
        setError("No matching documents found.");
        setResults([]);
      } else {
        setResults(data.results);
      }
    } catch (e) {
      setError("No document found.");
    }
    setLoading(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(120deg, #f8fafc 0%, #e0e7ff 100%)",
        py: { xs: 2, sm: 4, md: 6 },
      }}
    >
      <Container maxWidth="md" sx={{ px: { xs: 1, sm: 2 } }}>
        <Paper
          elevation={6}
          sx={{
            p: { xs: 2, sm: 3, md: 4 },
            borderRadius: 4,
            background: "rgba(255,255,255,0.95)",
            boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.15)",
          }}
        >
          <Typography
            variant={isMobile ? "h4" : "h3"}
            fontWeight={700}
            color="primary"
            gutterBottom
            sx={{
              fontFamily: "Montserrat, sans-serif",
              textAlign: "center",
              letterSpacing: 1,
              fontSize: { xs: "2rem", sm: "2.5rem", md: "3rem" },
            }}
          >
            Document Search Engine
          </Typography>
          <Typography
            variant="subtitle1"
            color="text.secondary"
            sx={{
              textAlign: "center",
              mb: 3,
              fontSize: { xs: "1rem", sm: "1.1rem" },
            }}
          >
            Enter your query to search across your document corpus.
          </Typography>
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
              mb: 2,
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <TextField
              value={query}
              onChange={(e: any) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your search query..."
              variant="outlined"
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon color="primary" />
                  </InputAdornment>
                ),
                endAdornment: query && (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="clear"
                      onClick={() => setQuery("")}
                      edge="end"
                      size="small"
                    >
                      <HighlightOffIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                background: "#f4f6fb",
                borderRadius: 2,
                boxShadow: "0 1px 4px #e0e7ff",
                fontSize: { xs: "1rem", sm: "1.1rem" },
              }}
            />
            <Button
              variant="contained"
              color="primary"
              size={isMobile ? "medium" : "large"}
              onClick={handleSearch}
              sx={{
                px: { xs: 2, sm: 4 },
                py: { xs: 1, sm: 1.5 },
                fontWeight: 600,
                borderRadius: 2,
                boxShadow: "0 2px 8px #c7d2fe",
                width: { xs: "100%", sm: "auto" },
              }}
              disabled={loading}
              endIcon={<SearchIcon />}
            >
              Search
            </Button>
          </Box>
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
              <CircularProgress color="primary" />
            </Box>
          )}
          {error && (
            <Fade in={!!error}>
              <Typography
                color="error"
                sx={{ mt: 2, textAlign: "center", fontWeight: 500 }}
              >
                {error}
              </Typography>
            </Fade>
          )}
          {!loading && results.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography
                variant="h6"
                sx={{
                  mb: 1,
                  fontWeight: 600,
                  color: "#3730a3",
                  letterSpacing: 0.5,
                  fontSize: { xs: "1.1rem", sm: "1.25rem" },
                }}
              >
                Top Results:
              </Typography>
              <Paper
                sx={{
                  maxHeight: { xs: 250, sm: 350 },
                  overflow: "auto",
                  borderRadius: 2,
                  background: "#f1f5f9",
                  boxShadow: "0 2px 8px #e0e7ff",
                }}
              >
                <List>
                  {results.map((doc) => (
                    <ListItem
                      key={doc.doc_id}
                      disablePadding
                      sx={{ borderBottom: "1px solid #e0e7ff" }}
                    >
                      <ListItemButton
                        onClick={() => setSelectedDoc(doc)}
                        sx={{
                          "&:hover": {
                            background: "#e0e7ff",
                          },
                        }}
                      >
                        <ListItemText
                          primary={
                            <span>
                              <b>
                                Doc {doc.doc_id} ({doc.filename})
                              </b>
                            </span>
                          }
                          secondary={
                            <span>
                              <b>Score:</b> {doc.score.toFixed(4)}
                            </span>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  ))}
                </List>
              </Paper>
            </Box>
          )}
        </Paper>
      </Container>

      {/* Document Dialog */}
      <Dialog
        open={!!selectedDoc}
        onClose={() => setSelectedDoc(null)}
        maxWidth="md"
        fullWidth
        scroll="paper"
        PaperProps={{
          sx: { borderRadius: 3, background: "#f8fafc" },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pr: 2,
            pb: 0,
          }}
        >
          <Box>
            <Typography
              variant="h6"
              fontWeight={700}
              fontSize={{ xs: "1.1rem", sm: "1.25rem" }}
            >
              {selectedDoc?.filename}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Score: {selectedDoc?.score.toFixed(4)}
            </Typography>
          </Box>
          <IconButton onClick={() => setSelectedDoc(null)}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent
          dividers
          sx={{ background: "#f4f6fb", p: { xs: 1, sm: 2 } }}
        >
          <Box
            sx={{
              fontFamily: "Menlo, monospace",
              fontSize: { xs: "0.95rem", sm: "1.05rem" },
              color: "#22223b",
              lineHeight: 1.7,
              whiteSpace: "pre-wrap",
              wordBreak: "break-word",
              background: "#f4f6fb",
              borderRadius: 2,
              p: { xs: 1, sm: 2 },
              minHeight: { xs: 150, sm: 300 },
              maxHeight: { xs: 300, sm: 600 },
              overflow: "auto",
            }}
          >
            {selectedDoc &&
              highlightText(
                selectedDoc.text,
                query.split(/\s+/).filter(Boolean)
              )}
          </Box>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default App;
