<?php
/**
 * @package yii2-azure-communication-services
 * @author Simon Karlen <simi.albi@outlook.com>
 */

namespace raiffeisen\acs\widgets;

use yii\web\AssetBundle;

class TeamsClientAsset extends AssetBundle
{
    /**
     * @inheritdoc
     */
    public $sourcePath = '@raiffeisen/acs/assets/dist';

    /**
     * @inheritdoc
     */
    public $css = [
        'teams-client.css'
    ];

    /**
     * @inheritdoc
     */
    public $js = [
        'teams-client.min.js'
    ];
}
