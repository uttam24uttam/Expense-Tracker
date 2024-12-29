import React, { useState } from "react";
import { Modal, Input, Button } from "antd";

function SettleUp({ visible, onCancel, onSettleUp }) {
    const [settleAmount, setSettleAmount] = useState("");

    const handleSettleUp = () => {
        if (!settleAmount || settleAmount <= 0) {
            alert("Please enter a valid amount.");
            return;
        }
        onSettleUp(settleAmount);
    };

    return (
        <Modal
            title="Settle Up"
            visible={visible}
            onCancel={onCancel}
            onOk={handleSettleUp}
        >
            <p>Enter the amount you want to settle:</p>
            <Input
                type="number"
                value={settleAmount}
                onChange={(e) => setSettleAmount(e.target.value)}
            />
        </Modal>
    );
}

export default SettleUp;
