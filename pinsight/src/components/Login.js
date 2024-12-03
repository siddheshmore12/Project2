import React from 'react'
import { FaPinterest } from "react-icons/fa"; // Import Pinterest icon
import 'bootstrap/dist/css/bootstrap.min.css';
import { Card, Form, Button, Container, Row, Col } from "react-bootstrap";

const Login = () => {
    const handlePinterestLogin = () => {
        // Redirect to your backend's Pinterest OAuth URL
        window.location.href = 'http://localhost:5000/auth/pinterest';
    };
    const backgroundImage = require("./backImage.png");

    return (
        <Container fluid
                   className="d-flex justify-content-center align-items-center vh-100 bg-light"
                   style={{
                       backgroundImage: `url(${backgroundImage})`,
                       backgroundSize: "cover",
                       backgroundPosition: "center",
                       backgroundRepeat: "no-repeat",
                       height: "100vh",
                   }}>
            <Row>
                <Col>
                    <Card className="p-5 shadow-lg" style={{ width: "30rem" }}>
                        <Card.Body>
                            <Card.Title className="text-center mb-4">
                                <h3>Login to FaceInsight</h3>
                            </Card.Title>
                            <Form>
                                <Button
                                    onClick={handlePinterestLogin}
                                    variant="danger"
                                    type="button"
                                    className="w-100 d-flex align-items-center justify-content-center"
                                >
                                    <FaPinterest style={{ marginRight: "8px" }} /> Login with Pinterest
                                </Button>
                            </Form>
                            <Card.Text className="text-center text-muted mt-3">
                                Use your Pinterest account to get started.
                            </Card.Text>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default Login;
