<?php
// Simple enquiry handler – edit the email below. Works on any PHP hosting with mail() enabled (free).
header('Content-Type: application/json');
$to = 'youremail@example.com';   // <-- CHANGE THIS to the developer's / your email
$from = 'no-reply@' . ($_SERVER['HTTP_HOST'] ?? 'example.com');

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !empty($_POST['website'])) { // honeypot
  echo json_encode(['ok'=>false,'error'=>'invalid']); exit;
}
$clean = fn($k) => trim(strip_tags($_POST[$k] ?? ''));
$name = $clean('name'); $phone = $clean('phone'); $email = $clean('email'); $city = $clean('city');
if ($name === '' || !preg_match('/^[0-9]{10}$/', $phone)) { echo json_encode(['ok'=>false,'error'=>'validation']); exit; }
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) $email = '';

$body = "New enquiry – Ketaki Arcade Wing A2\n\nName: $name\nPhone: $phone\nEmail: $email\nCity: $city\nOpt-in: " . (isset($_POST['optin']) ? 'Yes' : 'No') . "\nTime: " . date('d-m-Y H:i') . "\n";
$headers = "From: $from\r\n" . ($email ? "Reply-To: $email\r\n" : '');
$sent = @mail($to, 'New Enquiry – Ketaki Arcade', $body, $headers);

// also keep a local log so no lead is lost
@file_put_contents(__DIR__ . '/leads.csv', '"' . implode('","', [date('c'), $name, $phone, $email, $city]) . "\"\n", FILE_APPEND | LOCK_EX);

echo json_encode(['ok'=>true,'mailed'=>$sent]);
