import React from 'react';
import styled from 'styled-components';
import { Tag, Typography } from 'antd';

const { Text } = Typography;

const TagComponent = styled(Tag)`
  display: flex;
  align-items: center;
  margin: 0;
  padding: 4px 8px;
  border-radius: 4px;
  cursor: ${(props) => (props.clickable ? 'pointer' : 'default')};

  .ant-typography {
    margin: 0;
    font-size: 12px;
    line-height: 1.2;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const TeacherTag = ({
  teacher,
  clickable = false,
  onClick = () => {},
  style = {},
  ...rest
}) => {
  const handleClick = () => {
    if (clickable && teacher) {
      onClick(teacher);
    }
  };

  if (!teacher) return null;

  const displayName = teacher.name || '선생님';

  return (
    <TagComponent
      color="blue"
      onClick={handleClick}
      clickable={clickable}
      style={{ maxWidth: '100%', ...style }}
      {...rest}
    >
      <Text ellipsis>{displayName}</Text>
    </TagComponent>
  );
};

export default TeacherTag; 