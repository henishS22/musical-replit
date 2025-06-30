/* eslint-disable react/prop-types */
/* eslint-disable object-curly-newline */
/* eslint-disable max-len */
import React, { useEffect, useState } from "react";
// import { useNavigate } from 'react-router';
import Table from "../../../../../../Components/Table/Table";
// import USERLIST from '../../../../../../_mocks/collectible';
import { tabStyles } from "./TableStyles";

const CollectionRequest = ({ projectList }) => {
  const classes = tabStyles();

  // const navigate = useNavigate();
  // const handleViewButton = () => {
  //   navigate('/admin/user/view-user');
  // };

  const [projectListData, setProjectListData] = useState([]);

  useEffect(() => {
    const list = projectList?.map((project) => ({
      name: project?.name || "N/A",
      music: project?.music || "N/A",
      minted_music: project?.minted_music || "N/A",
      collaborations: project?.collaborations?.length || 0,
      createdAt: project?.createdAt || "N/A",
      updatedAt: project?.updatedAt || "N/A",
      id: project?.id || "N/A",
    }));
    setProjectListData(list);
  }, [projectList]);

  const TABLE_HEAD = [
    { id: "id", flag: "id", label: "Sr.No", alignRight: false },
    {
      id: "name",
      flag: "name",
      label: "Project Name",
      alignRight: false,
    },
    { id: "music", flag: "music", label: "No of Musics", alignRight: false },
    {
      id: "minted_music",
      flag: "minted_music",
      label: "No of Minted Musics",
      alignRight: false,
    },
    {
      id: "collaborations",
      flag: "collaborations",
      label: "No of Collaborations",
      alignRight: false,
    },
    {
      id: "createdAt",
      flag: "createdAt",
      label: "Created On",
      alignRight: false,
    },
    {
      id: "updatedAt",
      flag: "updatedAt",
      label: "Updated On",
      alignRight: false,
    },
    // {
    //   id: 'actions',
    //   flag: { read: true, edit: false, remove: false },
    //   callback: { handleViewButton },
    //   label: 'Actions',
    //   alignRight: false,
    // },
  ];

  return (
    <div className={classes.projectlisttable}>
      {projectListData && projectListData.length > 0 ? (
        <Table
          USERLIST={projectListData}
          TABLE_HEAD={TABLE_HEAD}
          noPagination
        />
      ) : (
        <h3>No Data Found</h3>
      )}
    </div>
  );
};

export default CollectionRequest;

// const DesignPending = () => <h2> Design Pending</h2>;

// export default DesignPending;
