<?php
/**
 * @package yii2-azure-communication-services
 * @author Simon Karlen <simi.albi@outlook.com>
 */

namespace raiffeisen\acs\widgets;

use rmrevin\yii\fontawesome\FAS;
use Yii;
use yii\base\InvalidConfigException;
use yii\base\Widget;
use yii\helpers\Html;

class TeamsClient extends Widget
{
    /**
     * @var string A user access token issued by Communication Services.
     */
    public $token;

    /**
     * @var string The url of the Communication Services resource.
     */
    public $chatEndpointUrl;

    /**
     * @var string Id of the CommunicationUser as returned from the Communication Service.
     */
    public $communicationUserId;

    /**
     * @var string Display name for the chat participant.
     */
    public $displayName = 'Website User';

    /**
     * @var array the HTML attributes for the widget container tag.
     * @see \yii\helpers\Html::renderTagAttributes() for details on how attributes are being rendered.
     */
    public $options = [
        'class' => ['widget' => 'teams-chat']
    ];

    /**
     * {@inheritDoc}
     * @throws InvalidConfigException
     */
    public function init()
    {
        if (empty($this->token)) {
            throw new InvalidConfigException('`token` parameter must be set');
        }
        if (empty($this->communicationUserId)) {
            throw new InvalidConfigException('`communicationUserId` parameter mus be set');
        }
        if (!isset($this->options['id'])) {
            $this->options['id'] = $this->getId();
        }

        parent::init();
    }

    /**
     * {@inheritDoc}
     */
    public function run(): string
    {
        $html = Html::beginTag('div', $this->options);
        $html .= Html::beginTag('div', [
            'class' => ['chat-header']
        ]);
        $html .= Html::tag('span', $this->displayName, ['class' => ['display-name']]);

        $html .= Html::beginTag('div', [
            'class' => ['btn-group'],
            'role' => 'group',
            'aria' => ['label' => 'Tool Buttons']
        ]);
        $html .= Html::button(FAS::i('video'), [
            'class' => ['start-video-button', 'btn', 'btn-secondary'],
            'type' => 'button'
        ]);
        $html .= Html::button(FAS::i('video-slash'), [
            'class' => ['stop-video-button', 'btn', 'btn-secondary'],
            'type' => 'button',
            'style' => ['display' => 'none']
        ]);
        $html .= Html::button(FAS::i('phone'), [
            'class' => ['call-button', 'btn', 'btn-secondary'],
            'type' => 'button'
        ]);
        $html .= Html::button(FAS::i('phone-slash'), [
            'class' => ['hangup-button', 'btn', 'btn-secondary'],
            'type' => 'button',
            'style' => ['display' => 'none']
        ]);
        $html .= Html::endTag('div'); // .btn-group
        $html .= Html::endTag('div'); // .chat-header

        $html .= Html::beginTag('div', ['class' => ['chat-body']]);
        $html .= Html::tag('div', '', [
            'class' => ['chat-container']
        ]);
        $html .= Html::textarea('chat-input', '', [
            'class' => ['chat-input']
        ]);
        $html .= Html::tag('div', '', [
            'class' => ['remote-video-container'],
            'style' => ['display' => 'none']
        ]);
        $html .= Html::tag('div', '', [
            'class' => ['local-video-container'],
            'style' => ['display' => 'none']
        ]);
        $html .= Html::endTag('div'); // .chat-body
        $html .= Html::endTag('div');

        $this->registerPlugin();

        return $html;
    }

    /**
     * Registers a specific Bootstrap plugin and the related events
     */
    protected function registerPlugin(): void
    {
        TeamsClientAsset::register($this->view);

        $js = <<<JS
window.teams = new TeamsClient(
    '{$this->token}',
    '{$this->communicationUserId}',
    '{$this->chatEndpointUrl}',
    jQuery('#{$this->options['id']} .chat-input')[0],
    jQuery('#{$this->options['id']} .chat-container')[0],
    jQuery('#{$this->options['id']} .call-button')[0],
    jQuery('#{$this->options['id']} .hangup-button')[0],
    jQuery('#{$this->options['id']} .stop-video-button')[0],
    jQuery('#{$this->options['id']} .start-video-button')[0],
    jQuery('#{$this->options['id']} .remote-video-container')[0],
    jQuery('#{$this->options['id']} .local-video-container')[0],
    '{$this->displayName}'
);
window.teams.initChatClient('');
window.teams.initCallClient();
JS;

        $this->view->registerJs($js, $this->view::POS_READY, 'teams-client');
    }
}
