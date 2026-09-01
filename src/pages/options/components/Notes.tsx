import { Fragment, useEffect, useState } from "react";
import * as notesController from "@src/server/controller/notes.controller";
import { OK } from "@src/server/common/code";
import { ChevronRight, Delete, ExpandMore } from "@mui/icons-material";
import {
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import dayjs from "dayjs";
import { INote } from "@src/server/db/database";

export function Notes() {
  const [list, setList] = useState([]);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const onDelete = (id: number) => {
    notesController.deleteItem(id).then(() => {
      fetch();
    });
  };

  function fetch() {
    notesController.list().then((resp) => {
      if (resp.code === OK.code) {
        setList(resp.data);
      }
    });
  }

  useEffect(() => {
    fetch();
  }, []);

  return (
    <div>
      <TableContainer component={Paper} variant="outlined">
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell sx={{ width: "40px" }} />
              <TableCell sx={{ width: "150px" }}>ID</TableCell>
              <TableCell sx={{ width: "100px" }}>Link</TableCell>
              <TableCell>Content</TableCell>
              <TableCell sx={{ width: "100px" }}>Date</TableCell>
              <TableCell sx={{ width: "100px" }}>Options</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {list.map((record) => (
              <Fragment key={record.id}>
                <TableRow
                  hover
                  sx={{ cursor: "pointer" }}
                  onClick={() =>
                    setExpandedId(expandedId === record.id ? null : record.id)
                  }
                >
                  <TableCell>
                    {expandedId === record.id ? (
                      <ExpandMore fontSize="small" />
                    ) : (
                      <ChevronRight fontSize="small" />
                    )}
                  </TableCell>
                  <TableCell>{record.id}</TableCell>
                  <TableCell>
                    <a
                      target="_blank"
                      rel="noreferrer"
                      href={`https://${record.domain}${record.path}`}
                    >
                      Link
                    </a>
                  </TableCell>
                  <TableCell
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                      maxWidth: 300,
                    }}
                  >
                    {record.content}
                  </TableCell>
                  <TableCell>
                    {dayjs(record.createTime).format("YYYY-MM-DD")}
                  </TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(record.id);
                      }}
                    >
                      <Delete fontSize="small" />
                    </IconButton>
                  </TableCell>
                </TableRow>
                {expandedId === record.id && (
                  <TableRow>
                    <TableCell colSpan={6} sx={{ bgcolor: "action.hover" }}>
                      <NoteComments nid={record.id} />
                    </TableCell>
                  </TableRow>
                )}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  );
}

function NoteComments(props: { nid: number }) {
  const [comments, setComments] = useState([]);

  useEffect(() => {
    notesController.query({ nid: props.nid }).then((resp) => {
      if (resp.code === OK.code) {
        setComments(resp.data);
      }
    });
  }, [props.nid]);

  return (
    <List dense disablePadding>
      {comments.map((record, index) => (
        <ListItem key={index} divider disableGutters>
          <ListItemText primary={record.content} />
        </ListItem>
      ))}
    </List>
  );
}
