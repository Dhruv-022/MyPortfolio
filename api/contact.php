<?php
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(["status" => "error", "message" => "Method Not Allowed"]);
    exit;
}

$webhookURL = "https://discord.com/api/webhooks/1471824299534061761/ZOv0jd4_KiMBddhB1urOOD0hjA8sHKztkSqGR77zwShaFSzT80HxZaeEABpqWnq1pOXl";

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Invalid JSON"]);
    exit;
}

$discordPayload = [
    "content" => "🚀 **New Portfolio Contact**",
    "embeds" => [[
        "title" => $data['subject'] ?? "No Subject",
        "color" => 5814783,
        "fields" => [
            ["name" => "Sender", "value" => $data['name'] ?? "Anonymous", "inline" => true],
            ["name" => "Email", "value" => $data['email'] ?? "Not Provided", "inline" => true],
            ["name" => "Message", "value" => $data['message'] ?? "No message content."]
        ],
        "timestamp" => date('c')
    ]]
];

$ch = curl_init($webhookURL);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
curl_setopt($ch, CURLOPT_POST, 1);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($discordPayload));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode >= 200 && $httpCode < 300) {
    echo json_encode(["status" => "success", "message" => "Transmission Successful"]);
} else {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Failed to send to Discord"]);
}
?>

