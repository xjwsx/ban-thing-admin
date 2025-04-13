import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Descriptions, 
  Space, 
  Divider,
  Typography,
  Spin,
  message
} from 'antd';
import { getDoctorDetail, deleteDoctor } from '../../api/crm';
import './DoctorDetailPage.css';

const { Title } = Typography;

const DoctorDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDoctorDetail();
  }, [id]);

  const fetchDoctorDetail = async () => {
    try {
      setLoading(true);
      const response = await getDoctorDetail(id);
      setDoctor(response.data);
    } catch (error) {
      console.error('의사 정보를 불러오는데 실패했습니다:', error);
      message.error('의사 정보를 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/doctors/edit/${id}`);
  };

  const handleDelete = async () => {
    try {
      await deleteDoctor(id);
      message.success('의사 정보가 삭제되었습니다.');
      navigate('/doctors');
    } catch (error) {
      console.error('의사 정보 삭제에 실패했습니다:', error);
      message.error('의사 정보 삭제에 실패했습니다.');
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div className="doctor-detail-container">
      <div className="doctor-detail-header">
        <Title level={3}>의사 정보</Title>
        <Space>
          <Button type="primary" onClick={handleEdit}>
            수정
          </Button>
          <Button danger onClick={handleDelete}>
            삭제
          </Button>
        </Space>
      </div>

      {doctor && (
        <Card className="doctor-detail-card">
          <Descriptions bordered column={2}>
            <Descriptions.Item label="이름">{doctor.name || '-'}</Descriptions.Item>
            <Descriptions.Item label="이메일">{doctor.email || '-'}</Descriptions.Item>
            <Descriptions.Item label="전화번호">{doctor.phone || '-'}</Descriptions.Item>
            <Descriptions.Item label="진료과">{doctor.specialty || '-'}</Descriptions.Item>
            <Descriptions.Item label="직위">{doctor.position || '-'}</Descriptions.Item>
            <Descriptions.Item label="입사일">{doctor.joinDate || '-'}</Descriptions.Item>
          </Descriptions>

          <Divider />

          <div className="doctor-detail-actions">
            <Space>
              <Button type="default" onClick={() => navigate('/doctors')}>
                목록으로
              </Button>
            </Space>
          </div>
        </Card>
      )}
    </div>
  );
};

export default DoctorDetailPage; 