/*
 * Copyright 2018 WICKLETS LLC
 *
 * This file is part of Wick Editor.
 *
 * Wick Editor is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Wick Editor is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with Wick Editor.  If not, see <https://www.gnu.org/licenses/>.
 */

import React, { Component } from 'react';

import ProjectSettings from '../ProjectSettings/ProjectSettings';
import AlphaWarning from '../AlphaWarning/AlphaWarning';

class ModalHandler extends Component {
  render() {
    return (
      <div>
        <ProjectSettings
          project={this.props.project}
          updateProject={this.props.updateProject}
          openModal={this.props.openModal}
          open={this.props.openModalName === 'ProjectSettings'}
          toggle={() => this.props.openModal(null)}
        />
        <AlphaWarning
          className="alpha-warning"
          openModal={this.props.openModal}
          open={this.props.openModalName === 'AlphaWarning'}
          toggle={() => this.props.openModal(null)}
        />
      </div>
    );
  }
}

export default ModalHandler
