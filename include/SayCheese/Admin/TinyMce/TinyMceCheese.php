<?php

namespace SayCheese\Admin\TinyMce;

class TinyMceCheese extends TinyMce {

	protected $module_name = 'cheese';

	protected $editor_buttons = array(
		'mce_buttons'	=> array(
			'cheese'	=> 3000,
		),
	);

	protected $toolbar_css = true;
	protected $editor_css = true;
	protected $text_widget = true;

	/**
	 * Private constructor
	 */
	protected function __construct() {
		$this->plugin_params = array(
			'l10n' => array(
				'small'	=> __( 'Small', 'mcguffin' ),
				'big'	=> __( 'Big', 'mcguffin' ),
			),
		);
		$this->mce_settings =  array(
			'extended_valid_elements' => 'canvas',
			'custom_elements' => 'canvas',
		);
		parent::__construct();
	}
}
