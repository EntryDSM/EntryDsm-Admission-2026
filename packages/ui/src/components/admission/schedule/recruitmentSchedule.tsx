import styled from "@emotion/styled";

import { colors } from "@entry/design";

interface RecruitmentScheduleItemProps {
  category: string;
  date: string;
  note: string;
}

interface RecruitmentNoteProps {
  notes: string[];
}

interface RecruitmentScheduleProps {
  scheduleItems: RecruitmentScheduleItemProps[];
  notes: string[];
}

// 개별 일정 항목
const ScheduleItem = ({ category, date, note }: RecruitmentScheduleItemProps) => {
  return (
    <TableRow>
      <CategoryCell>{category}</CategoryCell>
      <TableCell>{date}</TableCell>
      <TableCell>{note}</TableCell>
    </TableRow>
  );
};

// 유의 사항 항목
const NoteItem = ({ notes }: RecruitmentNoteProps) => {
  return (
    <TableRow>
      <CategoryCell>기타</CategoryCell>
      <NoteCell colSpan={2}>
        <NoteList>
          {notes.map((note, index) => (
            <NoteListItem key={index}>
              {index + 1}. {note}
            </NoteListItem>
          ))}
        </NoteList>
      </NoteCell>
    </TableRow>
  );
};

// 메인 테이블
export const RecruitmentSchedule = ({ scheduleItems, notes }: RecruitmentScheduleProps) => {
  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableHeaderCell>구분</TableHeaderCell>
            <TableHeaderCell>일정</TableHeaderCell>
            <TableHeaderCell>비고</TableHeaderCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {scheduleItems.map((item, index) => (
            <ScheduleItem key={index} category={item.category} date={item.date} note={item.note} />
          ))}
          <NoteItem notes={notes} />
        </TableBody>
      </Table>
    </TableContainer>
  );
};

const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
`;

// 좁은 화면에서 셀이 줄바꿈돼 행 높이가 들쭉날쭉해지지 않도록 디자인 폭을 유지하고
// 가로 스크롤로 넘긴다 (행 높이 31px 고정)
const Table = styled.table`
  width: 100%;
  min-width: 1040px;
  table-layout: fixed;
  border-collapse: collapse;
  border: 1px solid ${colors.gray[200]};
  border-top: 2px solid ${colors.orange[800]};
  font-size: 16px;
  font-weight: 500;
  line-height: 18px;
  color: ${colors.gray[500]};
  /* 데이터에 넣은 \\n 위치에서 줄바꿈된다 */
  white-space: pre-line;
`;

const TableHead = styled.thead`
  background-color: ${colors.gray[100]};
`;

const TableBody = styled.tbody``;

// border-collapse 로 마지막 행의 아래 선은 테이블 테두리와 합쳐진다
const TableRow = styled.tr`
  border-bottom: 1px solid ${colors.gray[200]};
`;

const TableHeaderCell = styled.th`
  padding: 6px 12px;
  text-align: center;
  font-weight: 500;
  border-right: 1px solid ${colors.gray[200]};

  &:last-child {
    border-right: none;
  }
`;

const CategoryCell = styled.td`
  padding: 6px 12px;
  text-align: center;
  border-right: 1px solid ${colors.gray[200]};
  background-color: ${colors.gray[100]};
`;

const TableCell = styled.td`
  padding: 6px 12px;
  text-align: center;
  border-right: 1px solid ${colors.gray[200]};

  &:last-child {
    border-right: none;
  }
`;

const NoteCell = styled.td`
  padding: 11px 32px;
  text-align: left;
`;

const NoteList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;

const NoteListItem = styled.li`
  line-height: 19px;
`;
