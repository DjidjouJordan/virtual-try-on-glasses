<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Code OTP</title>
</head>

<body style="margin:0;padding:0;background:#0f172a;font-family:Arial,sans-serif;">

<div style="max-width:600px;margin:40px auto;background:#111827;border-radius:12px;overflow:hidden;">

    <!-- HEADER -->
    <div style="background:#2563eb;padding:20px;text-align:center;">
        <h1 style="color:#fff;margin:0;font-size:22px;">
            DPGlasses
        </h1>
        <p style="color:#dbeafe;margin:5px 0 0;">
            Vérification de sécurité
        </p>
    </div>

    <!-- BODY -->
    <div style="padding:30px;color:#e5e7eb;">

        <p style="font-size:16px;">
            Bonjour,
        </p>

        <p style="font-size:14px;line-height:1.6;color:#cbd5e1;">
            Voici votre code de vérification pour :
            <strong>{{ $purpose }}</strong>
        </p>

        <!-- OTP BOX -->
        <div style="text-align:center;margin:30px 0;">
            <div style="
                display:inline-block;
                background:#1f2937;
                padding:20px 30px;
                border-radius:10px;
                letter-spacing:6px;
                font-size:28px;
                font-weight:bold;
                color:#60a5fa;
                border:1px solid #334155;
            ">
                {{ $code }}
            </div>
        </div>

        <p style="text-align:center;color:#94a3b8;font-size:13px;">
            Ce code expire dans <strong>{{ $expiresIn }} minutes</strong>.
        </p>

        <hr style="border:none;border-top:1px solid #334155;margin:25px 0;">

        <p style="font-size:12px;color:#64748b;line-height:1.6;">
            Si vous n’êtes pas à l’origine de cette demande, ignorez cet email.
            Aucun changement ne sera effectué sans ce code.
        </p>
    </div>

    <!-- FOOTER -->
    <div style="background:#0b1220;text-align:center;padding:15px;color:#64748b;font-size:12px;">
        © {{ date('Y') }} DPGlasses — Tous droits réservés
    </div>

</div>

</body>
</html>