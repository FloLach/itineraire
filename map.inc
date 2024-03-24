<?php

$itineraireModuleUrl = "/" . drupal_get_path('module', 'itineraire');

$mode = $_GET["mode"];

$mapCssClasses = array(
    "view" => "view",
    "print_portrait" => "print_portrait",
    "print_paysage" => "print_paysage",
);
if (!empty($_SESSION)) {
    $itineraireNode = $_SESSION["itineraireNode"];
}

$jsonData = array(
    "mapUri" => (!empty($_GET["mapUri"]) ? $_GET["mapUri"] : ''),
    "milestones" => json_decode(!empty($itineraireNode) ? $itineraireNode->milestones : ''),
);
// Cl� IGN cbvacc key=4846573327711237068
// Cl� IGN lachap key=5013164491739128823
// Cl� IGN devel key=gd84w06s9dzcu8trryuq77e3
?>

<html>
    <head>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <title>Coublevie Accueil - Itineraire de randonnee</title>
        <link rel="StyleSheet" href="<?php echo $itineraireModuleUrl?>/css/mapv2.css" />
        <style type="text/css">
        </style>
    </head>
    
    <body id="itineraireMapBody">        
        <div id="itineraireMapContainer" class="<?php echo $mapCssClasses[$mode]; ?>" data="<?php echo htmlentities(json_encode($jsonData)); ?>"></div>        
        <?php if (($mode == "print_portrait") or ($mode == "print_paysage")) { 
            
        ?>
        <input type="button" id="printButton" value="Imprimer" />
        
        <?php } ?>
        <script src="<?php echo $itineraireModuleUrl?>/javascript/mapv2.js"></script>
    </body>
</html>